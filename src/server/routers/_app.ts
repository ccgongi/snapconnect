import { z } from "zod";
import { procedure, router } from "../trpc";
import {
  // analyzeImageWithGPT,
  extractPersonFromImage,
  // generateMorningBriefMarkdown,
} from "../utilities";

interface PersonInfo {
  name: string | null;
  company: string | null;
  role: string | null;
  timestamp: string | null;
  imageUrl: string;
}

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

  // generateMorningBrief: procedure
  //   .input(
  //     z.object({
  //       images: z.array(z.string()),
  //     })
  //   )
  //   .mutation(async (opts) => {
  //     const BATCH_SIZE = 4;
  //     const analyses = [];

  //     // Process images in batches of 4
  //     for (let i = 0; i < opts.input.images.length; i += BATCH_SIZE) {
  //       const batch = opts.input.images.slice(i, i + BATCH_SIZE);
  //       const batchAnalyses = await Promise.all(
  //         batch.map((imageBase64) => analyzeImageWithGPT(imageBase64))
  //       );
  //       analyses.push(...batchAnalyses);
  //     }

  //     const brief = await generateMorningBriefMarkdown(analyses);

  //     return {
  //       analyses,
  //       brief,
  //     };
  //   }),
  extractPeople: procedure
    .input(
      z.object({
        images: z.array(z.string()),
      })
    )
    .mutation(async (opts) => {
      const BATCH_SIZE = 4;
      const people: PersonInfo[] = [];

      // Process images in batches of 4
      for (let i = 0; i < opts.input.images.length; i += BATCH_SIZE) {
        const batch = opts.input.images.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map((imageBase64) => extractPersonFromImage(imageBase64))
        );
        people.push(...batchResults);
      }

      return {
        people,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
