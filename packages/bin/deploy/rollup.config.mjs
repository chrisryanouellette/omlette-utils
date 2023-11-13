import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/index.ts",
  output: {
    file: "./dist/index.js",
    format: "module",
  },
  external: ["child_process"],
  plugins: [typescript()],
};
