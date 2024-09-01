module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: 'src',
  testMatch: ['**/*.spec.ts'],
};
