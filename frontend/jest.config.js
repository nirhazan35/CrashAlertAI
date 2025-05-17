module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: '.',

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!**/node_modules/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup files that run before each test
  setupFilesAfterEnv: [
    '<rootDir>/tests/setupTests.js'
  ],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],

  // Module name mapper to handle module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage'
}; 