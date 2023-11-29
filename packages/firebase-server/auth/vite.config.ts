import * as path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const fileNameWithExt = path.parse(packageJson.main).base;
const fileName = fileNameWithExt.split(".")[0];

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "node20",
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
        "os",
        "path",
        "zlib",
        "fs",
        "stream",
        "crypto",
        "http",
        "https",
        "events",
        "util",
        "url",
        "firebase-admin",
        "firebase-admin/auth",
        "@ouellettec/utils",
        "@ouellettec/utils-firebase-admin",
      ],
      output: {
        globals: {
          os: "os",
          path: "path",
          zlib: "zlib",
          fs: "fs",
          stream: "stream",
          crypto: "crypto",
          http: "http",
          https: "https",
          events: "events",
          util: "util",
          url: "url",
          "firebase-admin": "firebase-admin",
          "firebase-admin/auth": "firebase-admin/auth",
          "@ouellettec/utils": "@ouellettec/utils",
          "@ouellettec/utils-firebase-admin":
            "@ouellettec/utils-firebase-admin",
        },
      },
    },
  },
});
