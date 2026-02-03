export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'Controller/**/*.js',
    'Routes/**/*.js',
    'utils/**/*.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
