import { experimental_createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { AzureOpenAI } from "openai";

const endpoint = "https://gursa-me6mgrro-eastus2.cognitiveservices.azure.com/";
const modelName = "gpt-5-nano";
const deployment = "gpt-5-nano";
const apiKey = process.env.AZURE_GPT_NANO_KEY!;
const apiVersion = "2024-12-01-preview";
const options = { endpoint, apiKey, deployment, apiVersion };

const client = new AzureOpenAI(options);

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  let collectedContent = "";
  let stdioClient: any;
  let clientOne: any;
  let clientTwo: any;
  let clientThree: any;
  try {
    // Alternatively, you can connect to a Server-Sent Events (SSE) MCP server:
    clientTwo = await experimental_createMCPClient({
      transport: {
        type: "sse",
        url: "http://209.38.122.42:8000/sse",
      },
    });

    const toolSetTwo = await clientTwo.tools();
    const tools = {
      ...toolSetTwo, // note: this approach causes subsequent tool sets to override tools with the same name
    };

    // Convert MCP tools to OpenAI format
    const openAITools = Object.values(tools)
      .filter((tool: any) => tool && tool.name && tool.description)
      .map((tool: any) => ({
        type: "function" as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema || { type: "object", properties: {} },
        },
      }));

    // First LLM call with tools (only if we have valid tools)
    const response = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: prompt }],
      ...(openAITools.length > 0 && { tools: openAITools }),
      stream: true,
    });

    // Collect the content from first stream
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        collectedContent += delta.content;
      }
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.function?.name && toolCall.function?.arguments) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const tool = tools[toolCall.function.name];
              if (tool) {
                const result = await clientTwo.callTool(toolCall.function.name, args);
                collectedContent += JSON.stringify(result);
              }
            } catch (error) {
              console.error("Tool call error:", error);
            }
          }
        }
      }
    }

    // Second LLM call using collected content as context
    const contextPrompt = `
Previous analysis result:
${collectedContent}

Based on the above analysis, please provide a detailed summary of the changes and their potential impact.`;
    
    const analysisResponse = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: contextPrompt }],
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of analysisResponse) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              controller.enqueue(encoder.encode(delta.content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    if (stdioClient) {
      await stdioClient
        .close()
        .catch((e: Error) => console.error("Error closing client:", e));
    }
    if (clientTwo) {
      await clientTwo
        .close()
        .catch((e: Error) => console.error("Error closing MCP client:", e));
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}