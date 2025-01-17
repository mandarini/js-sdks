/* eslint-disable */
export default {
  displayName: 'react-lib',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/lib/react-lib',
  preset: '../../jest.preset.js',
}
