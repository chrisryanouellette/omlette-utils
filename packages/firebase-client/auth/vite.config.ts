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
        "firebase",
        "firebase/auth",
        "@ouellettec/utils",
        "@ouellettec/utils-firebase",
      ],
      output: {
        globals: {
          firebase: "firebase",
          "firebase/auth": "firebase/auth",
          "@ouellettec/utils": "@ouellettec/utils",
          "@ouellettec/utils-firebase": "@ouellettec/utils-firebase",
        },
      },
    },
  },
});
