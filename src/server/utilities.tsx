import { OpenAI } from "openai";

import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeImageWithGPT(
  imageBase64: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and provide key observations about: 1. Main subjects/objects 2. Activities/actions 3. Setting/environment 4. Notable details or unusual elements",
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image");
  }
}

export async function generateMorningBriefMarkdown(
  analyses: string[]
): Promise<string> {
  try {
    const analysisContext = analyses.join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional brief writer. Create concise, well-structured morning briefs in markdown format.",
        },
        {
          role: "user",
          content: `Based on the following image analyses, create a morning brief in markdown format. Include relevant sections and highlights:\n\n${analysisContext}`,
        },
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating brief:", error);
    throw new Error("Failed to generate morning brief");
  }
}
