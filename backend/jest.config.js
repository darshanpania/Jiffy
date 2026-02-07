/**
 * Jest Configuration for JIFFY Backend
 * Comprehensive testing setup for unit, integration, and E2E tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Coverage collection
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
  
  // Coverage thresholds (>80% required)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test timeout
  testTimeout: 30000, // 30 seconds for integration tests
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Module paths
  moduleDirectories: ['node_modules', 'src'],
  
  // Transform (for ES6 modules if needed)
  transform: {},
  
  // Test environment options
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  
  // Global setup/teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testTimeout: 10000,
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      testTimeout: 30000,
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      testTimeout: 60000,
    },
  ],
};
