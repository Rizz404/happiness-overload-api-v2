import { Config } from "jest";

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/utils/runDbForTest.ts"],
  };
};
