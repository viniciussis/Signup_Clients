const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  collectCoverage: true,
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/domain/entities/**.ts',
    'src/application/use-cases/**.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/application/dtos/**.ts',
    '!src/infrastructure/**',
    '!src/domain/**/**.interface.ts',
    '!src/**/constants.ts',
  ],
};
