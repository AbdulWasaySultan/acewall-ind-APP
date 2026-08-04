jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () =>
  // The official mock only has a `default` export, but app code consumes
  // this package via named imports (`import { useSafeAreaInsets } from
  // ...`). Unwrap `.default` so those named imports resolve correctly
  // against the mock's properties instead of coming back undefined.
  require('react-native-safe-area-context/jest/mock').default
);
