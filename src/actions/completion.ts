"use server";

import { experimental_createMCPClient } from "ai";
import { AzureOpenAI } from "openai";

const endpoint = "https://gursa-me6mgrro-eastus2.cognitiveservices.azure.com/";
const modelName = "gpt-5-nano";
const deployment = "gpt-5-nano";
const apiKey = process.env.AZURE_GPT_NANO_KEY!;
const apiVersion = "2024-12-01-preview";
const options = { endpoint, apiKey, deployment, apiVersion };

const client = new AzureOpenAI(options);

export async function generateCompletion(prompt: string) {
  try {
    let collectedContent = "";
    
    // Connect to MCP client
    const clientTwo = await experimental_createMCPClient({
      transport: {
        type: "sse",
        url: "http://209.38.122.42:8000/sse",
      },
    });

    const toolSetTwo = await clientTwo.tools();
    const tools = {
      ...toolSetTwo,
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

    // First LLM call with tools
    const response = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: prompt }],
      ...(openAITools.length > 0 && { tools: openAITools }),
      stream: false,
    });

    // Collect the content
    const content = response.choices[0]?.message?.content || "";
    collectedContent += content;

    // Handle tool calls if any
    if (response.choices[0]?.message?.tool_calls) {
      for (const toolCall of response.choices[0].message.tool_calls) {
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

    // Second LLM call using collected content as context
    const contextPrompt = `
Previous analysis result:
${collectedContent}

Based on the above analysis, please provide a detailed summary of the changes and their potential impact.`;
    
    const analysisResponse = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: contextPrompt }],
      stream: false,
    });

    const finalContent = analysisResponse.choices[0]?.message?.content || "";
    
    return { 
      success: true, 
      data: finalContent 
    };
  } catch (error) {
    console.error("Completion error:", error);
    return { 
      success: false, 
      error: "Failed to generate completion" 
    };
  }
}