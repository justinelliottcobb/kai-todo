import '@testing-library/react-native/build/matchers/extend-expect';

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    addOnValueChangedListener: jest.fn(() => ({ remove: jest.fn() })),
  })),
}));

// Silence animation warnings in tests
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Animated.timing = () => ({
    start: jest.fn(),
  });
  return rn;
});
