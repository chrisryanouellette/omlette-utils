/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  rootDir: "./",
  roots: ["<rootDir>", "<rootDir>/../../../__mocks__"],
  preset: "ts-jest",
  testEnvironment: "node",
  prettierPath: null, // Prettier 3 not supported
  collectCoverageFrom: ["./src/**/*.ts", "!./src/**/__test__/**/*.ts"],
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  watchPlugins: [
    "jest-watch-select-projects",
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
