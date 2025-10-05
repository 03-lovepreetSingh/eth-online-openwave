"use server";

import { db } from "@/db";
import { project } from "@/db/schema";
import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import { google } from "@ai-sdk/google";
import { streamText, CoreMessage } from "ai";
import { AzureOpenAI } from "openai";

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
  apiKey: process.env.AZURE_KEY_EMBEDDING,
  deployment: "text-embedding-3-large",
});

/**
 * Generates an embedding for a given text using Azure OpenAI's text-embedding-3-large model.
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await azureClient.embeddings.create({
      model: "text-embedding-3-large",
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

export async function updatePineconeIndex() {
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

    return {
      success: true,
      message: "Data successfully sent to Pinecone.",
      projectsProcessed: vectors.length,
    };
  } catch (error) {
    console.error("Error in updatePineconeIndex:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to process data: ${errorMessage}`,
    };
  }
}

export async function queryProjects(messages: CoreMessage[]) {
  try {
    const latestUserMessage = messages
      .filter((msg) => msg.role === "user")
      .pop();

    if (!latestUserMessage || typeof latestUserMessage.content !== "string") {
      return {
        success: false,
        error: "Invalid user message in request.",
      };
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

    return result;
  } catch (error) {
    console.error("Error in queryProjects:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to process RAG request: ${errorMessage}`);
  }
}