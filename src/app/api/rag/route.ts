import { NextResponse } from "next/server";
import { db } from "../../../db/index";
import { project } from "../../../db/schema";
import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import { google } from "@ai-sdk/google";
import { streamText, CoreMessage } from "ai";
import { AzureOpenAI } from "openai";
import { AzureKeyCredential } from "@azure/core-auth";

// --- Type Definitions ---
interface PineconeMetadata extends RecordMetadata {
  projectName: string;
  description: string;
  languages: string;
  owner: string;
}

// --- Pinecone Initialization ---
function getPineconeIndex() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY environment variable is not set.");
  }
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  return pinecone.index<PineconeMetadata>("gitfund");
}

// --- Azure OpenAI Client ---
const azureClient = new AzureOpenAI({
  apiVersion: "2024-12-01-preview",
  endpoint: "https://gursagar1107-6425-resource.cognitiveservices.azure.com/",
  apiKey: process.env.AZURE_KEY_EMBEDDING, // Missing comma and wrong env var name
  deployment: "text-embedding-3-large", // Missing comma
});

/**
 * Generates an embedding for a given text using Azure OpenAI's text-embedding-3-large model.
 * @param text The input text to embed.
 * @returns A promise that resolves to an array of numbers representing the embedding.
 *
 * NOTE: The model 'text-embedding-3-large' produces 3072-dimensional vectors.
 * Your Pinecone index MUST be configured with dimension 3072 to use this model.
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await azureClient.embeddings.create({
      model: "text-embedding-3-large", // deployment name
      input: text,
      encoding_format: "float",
      dimensions: 1024,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}

// Define type for Pinecone vector
interface PineconeVector {
  id: string;
  values: number[];
  metadata: PineconeMetadata;
}

export async function GET() {
  try {
    const index = getPineconeIndex();
    const allProjects = await db.select().from(project).execute();

    // Filter projects that have a description, as it's needed for embedding.
    const projectsWithDescription = allProjects.filter(
      (p) => p.aiDescription && p.aiDescription.trim() !== ""
    );

    // Generate embeddings for each project.
    const vectors: PineconeVector[] = await Promise.all(
      projectsWithDescription.map(async (p, id) => {
        const embedding = await getEmbedding(p.aiDescription!);

        // Ensure embedding is the correct type
        if (!Array.isArray(embedding) || embedding.some(isNaN)) {
          throw new Error(`Invalid embedding for project ${p.projectName}`);
        }

        return {
          id: id.toString(),
          values: embedding,
          metadata: {
            projectName: p.projectName || "Unnamed Project",
            description: p.aiDescription!,
            languages: JSON.stringify(p.languages),
            owner: p.projectOwner || "Unknown Owner",
          },
        };
      })
    );

    if (vectors.length > 0) {
      await index.upsert(vectors);
    }

    return NextResponse.json({
      success: true,
      message: "Data successfully sent to Pinecone.",
      projectsProcessed: vectors.length,
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to process data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const latestUserMessage = messages
      .filter((msg) => msg.role === "user")
      .pop();

    if (!latestUserMessage || typeof latestUserMessage.content !== "string") {
      return NextResponse.json(
        { error: "Invalid user message in request." },
        { status: 400 }
      );
    }

    // 1. Get embedding for the user's query.
    const queryEmbedding = await getEmbedding(latestUserMessage.content);

    // 2. Query Pinecone for relevant projects.
    const index = getPineconeIndex();
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3, // Retrieve the top 3 most relevant projects.
      includeMetadata: true,
    });

    // 3. Build the context string from query results.
    const context =
      queryResponse.matches
        ?.map((match) => {
          const metadata = match.metadata!; // We know metadata is included.
          return `Project: ${metadata.projectName}\nOwner: ${
            metadata.owner
          }\nDescription: ${
            metadata.description
          }\nRelevance Score: ${match.score?.toFixed(4)}\n`;
        })
        .join("\n---\n") ?? "";

    // 4. Create the system prompt with the retrieved context.
    const systemPrompt = `You are an expert assistant for openwave, a platform connecting open-source projects with contributors.
Your task is to answer user questions based ONLY on the context provided below.

CONTEXT:
---
${context}
---

IMPORTANT INSTRUCTIONS:
1.  ONLY use the information from the CONTEXT section to answer the query.
2.  If the context does not contain the answer, you MUST state: "I don't have enough information to answer that."
3.  Do NOT use any prior knowledge or information outside of the provided context.
4.  Do NOT make up or infer details not explicitly stated.
5.  When returning a project's details, format it clearly.
`;

    // 5. Stream the response from the AI model.
    const result = await streamText({
      model: google("models/gemini-2.5-flash"), // Using a powerful model for better generation.
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in POST handler (RAG):", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to process RAG request: ${errorMessage}` },
      { status: 500 }
    );
  }
}
