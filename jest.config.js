const { excludeCollectCoverageFrom } = require('./jest.excludeCollectCoverageFrom.config')

module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^api(.*)$': '<rootDir>/src/api$1',
    '^features(.*)$': '<rootDir>/src/features$1',
    '^fixtures(.*)$': '<rootDir>/src/fixtures$1',
    '^libs(.*)$': '<rootDir>/src/libs$1',
    '^shared(.*)$': '<rootDir>/src/shared$1',
    '^theme(.*)$': '<rootDir>/src/theme$1',
    '^types(.*)$': '<rootDir>/src/types$1',
    '^tests(.*)$': '<rootDir>/src/tests$1',
    '^ui(.*)$': '<rootDir>/src/ui$1',
    '^__mocks__(.*)$': '<rootDir>/__mocks__$1',
  },
  snapshotResolver: '<rootDir>/jest/custom-snapshot-resolver-native.js',
  setupFiles: ['<rootDir>/jest/jest.setup.ts', 'react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./src/tests/setupTests.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
      '|@react-navigation' +
      '|@react-native' +
      '|@ptomasroos/react-native-multi-slider' +
      '|react-navigation' +
      '|@react-native-firebase/analytics' +
      '|@react-native-firebase/app' +
      '|@react-native-firebase/remote-config' +
      '|@sentry/react-native' +
      '|react-native-geolocation-service' +
      '|instantsearch.js' +
      '/(?!(lib)))',
  ],
  testRegex: '(?<!.web).(?:test|spec).(?:tsx?|js)$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '\\.native-snap$',
    '\\.web-snap$',
    '<rootDir>/node_modules/',
    '<rootDir>/server/',
    '<rootDir>/e2e/',
  ],
  cacheDirectory: '.jest/cache',
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.web.{js,jsx,ts,tsx}',
    ...excludeCollectCoverageFrom,
  ],
  coveragePathIgnorePatterns: ['\\.web\\.(test|spec)', '/node_modules/', '/src/environment'],
  collectCoverage: false,
  // TODO(PC-20887): Investigate how to avoid timeouts in CI without increasing default timeout
  testTimeout: 10_000
}
