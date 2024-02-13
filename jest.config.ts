import { Config } from "jest";

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    moduleDirectories: ["node_modules", "src"],
    setupFilesAfterEnv: ["./src/utils/runDbForTest.ts"],
    moduleFileExtensions: ["js", "ts", "jsx", "tsx", "json", "node"],
    testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest",
    },
  };
};
