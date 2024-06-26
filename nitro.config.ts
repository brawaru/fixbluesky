import { getStorageMounts } from "./config/storage";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  storage: getStorageMounts(),
  devStorage: {
    bsky: {
      driver: "fs",
      base: ".nitro/data/bsky",
    },
  },
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
    },
  },
  esbuild: {
    options: {
      jsx: "automatic",
    },
  },
});
