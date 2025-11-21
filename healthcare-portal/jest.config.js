
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
};
