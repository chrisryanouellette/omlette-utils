import * as path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const fileNameWithExt = path.parse(packageJson.main).base;
const fileName = fileNameWithExt.split(".")[0];

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, "src/index.ts"),
      name: packageJson.name,
      // the proper extensions will be added
      fileName: fileName,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "zustand",
        "@ouellettec/utils",
        "@ouellettec/utils-types",
      ],
      output: {
        globals: {
          react: "React",
          zustand: "zustand",
          "@ouellettec/utils-types": "@ouellettec/utils-types",
          "@ouellettec/utils": "@ouellettec/utils",
        },
      },
    },
  },
});
