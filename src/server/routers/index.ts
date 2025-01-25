import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { openai } from "../openai";

export const appRouter = router({
  analyzeImage: publicProcedure
    .input(z.object({ image: z.string() }))
    .query(async ({ input }) => {
      // Call OpenAI API with the base64 image
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image in detail" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });
      
      return response.choices[0].message.content;
    }),
});