module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  globalTeardown: "./tests/teardown.js",
};
