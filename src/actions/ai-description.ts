"use server";

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from "ai";

export async function generateAIDescription(repoValue: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.warn('Google API key not found, using dummy configuration');
  }
  
  try {
    // Replace with your actual AI API logic
    const google = createGoogleGenerativeAI({ apiKey });
    const { text } = await generateText({
      model: google('models/gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: `Act as a senior technical writer and open-source documentation expert.
                    Analyze the following GitHub repository README and generate a structured, developer-focused summary (maximum 300 words).

                    Your output must include the following five clearly labeled sections, using concise, professional language:

                    1. 🚀 Project Overview
                    Summarize the project's main purpose, core functionality, and intended users or use cases.

                    2. 🧰 Technologies & Tools
                    Identify key programming languages, frameworks, libraries, or tools used in the project.

                    3. 🗂️ Repository Structure
                    Describe the high-level organization of the repository, including major directories or components and their roles.

                    4. ⚙️ Installation & Setup
                    Extract and summarize any setup, installation, or usage instructions provided in the README.

                    5. 🤝 Contributing
                    Highlight any contribution guidelines, including how developers can participate or submit changes (if mentioned).
                    Analyze the following GitHub README content and format your response accordingly: ${repoValue}`
        }
      ],
    });
    
    return { success: true, data: text };
  } catch (error) {
    console.error('AI description generation error:', error);
    return { success: false, error: 'Failed to generate summary' };
  }
}