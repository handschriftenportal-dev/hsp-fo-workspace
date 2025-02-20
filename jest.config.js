
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**'
  ],
  coverageDirectory: './test-reports',
  coverageReporters: ['lcov'],
  moduleDirectories: [
    'node_modules',
    '<rootDir>'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-reports',
      suiteName: 'hsp-fo-workspace'
    }]
  ],
  testMatch: [
    '**/test/**/*.spec.ts',
    '**/test/**/*.spec.tsx'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>test/testutils/mockPersist.ts'],
  moduleNameMapper: {
    '@fontsource/*': '<rootDir>/test/testutils/fontMock.ts', 
    'redux-persist': '<rootDir>test/testutils/mockPersist.ts'
  }
}
