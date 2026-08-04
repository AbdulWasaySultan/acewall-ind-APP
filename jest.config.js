module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // MaterialIcons (and other @react-native-vector-icons/* packages)
    // `require()` their .ttf font file directly for registration — Jest
    // tries to parse that binary as JS and fails without this stub.
    '\\.ttf$': '<rootDir>/__mocks__/fileMock.js',
    // lucide-react-native (used by SimpleIcon/VideoIcon) declares a
    // "react-native" package.json field pointing at its untranspiled ESM
    // build, which Jest's resolver picks over "main". Force resolution to
    // the prebuilt CJS entry instead of trying to teach Jest to handle .mjs.
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  // react-native's preset only transforms (jest-)?react-native and
  // @react-native(-community)? packages by default. react-native-safe-area-context's
  // own jest mock (registered in jest.setup.js) ships as untranspiled .tsx.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-safe-area-context)/)',
  ],
};
