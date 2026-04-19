/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/__tests__/**'],
  coverageDirectory: 'coverage',
  testTimeout: 15000,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
};
