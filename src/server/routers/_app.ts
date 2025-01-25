import { z } from "zod";
import { procedure, router } from "../trpc";
import { OpenAI } from "openai";

const openAIKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: openAIKey,
});

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  callOpenAi: procedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (opts) => {
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: opts.input.text }],
        model: "gpt-4",
      });
      return {
        greeting: chatCompletion.choices[0].message.content,
      };
    }),

  analyzeImage: procedure
    .input(
      z.object({
        imageBase64: z.string(),
      })
    )
    .query(async (opts) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this image and describe what you see." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${opts.input.imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });
      
      return {
        analysis: response.choices[0].message.content,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
