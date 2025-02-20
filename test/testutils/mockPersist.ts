jest.mock('redux-persist', () => ({
  persistReducer: jest.fn((config, reducers) => reducers),
  persistStore: jest.fn(),
  PersistGate: ({ children }: any) => children,
}))
module.exports = {}
