export default {
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Recycle workers after they reach a certain memory limit
  workerIdleMemoryLimit: '512MB',
};