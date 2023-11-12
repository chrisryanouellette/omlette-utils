import * as path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, "src/index.ts"),
      name: packageJson.name,
      // the proper extensions will be added
      fileName: path.parse(packageJson.main).name,
    },
  },
});
