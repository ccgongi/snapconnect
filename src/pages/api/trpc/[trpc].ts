import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/_app";
// export API handler
// @link https://trpc.io/docs/v11/server/adapters

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Set desired value here
    },
  },
};

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
