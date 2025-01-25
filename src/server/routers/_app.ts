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
      // call openai api, write something simple
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: opts.input.text }],
        model: "gpt-4o",
      });
      return {
        greeting: chatCompletion.choices[0].message.content,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
