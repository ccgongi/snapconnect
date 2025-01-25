import { OpenAI } from "openai";

import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PersonInfo {
  name: string | null;
  company: string | null;
  role: string | null;
  timestamp: string | null;
  imageUrl: string;
}

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

export async function extractPersonFromImage(
  imageBase64: string
): Promise<PersonInfo> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the following information from this LinkedIn screenshot or professional photo: 1. Full Name 2. Company 3. Role/Title 4. Any visible timestamp or date of interaction. Return ONLY a JSON object with these fields: {name, company, role, timestamp}. If any field is not found, use null.",
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
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    return {
      name: content.name || null,
      company: content.company || null,
      role: content.role || null,
      timestamp: content.timestamp || null,
      imageUrl: imageBase64,
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to extract person information");
  }
}
