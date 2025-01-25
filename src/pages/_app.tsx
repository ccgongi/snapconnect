import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
// Import global styles
import "../app/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
export default trpc.withTRPC(MyApp);
