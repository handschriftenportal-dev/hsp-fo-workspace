export function createMiradorInstanceMock() {
  return {
    unmount: jest.fn(),
    store: {
      getState: jest.fn(),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
    },
  }
}

export function createMiradorModuleMock(
  miradorInstanceMock: ReturnType<typeof createMiradorInstanceMock>,
) {
  return {
    actions: {
      updateConfig: jest.fn(),
      importMiradorState: jest.fn(),
      addWindow: jest.fn(),
      removeWindow: jest.fn(),
      updateWindow: jest.fn(),
      removeResource: jest.fn(),
      setWorkspaceAddVisibility: jest.fn(),
      setWorkspaceFullscreen: jest.fn(),
      updateWorkspace: jest.fn(),
    },

    selectors: {
      getWindow: jest.fn(),
      getWindowIds: jest.fn(),
    },

    create: jest.fn(function (miradorConfig: Record<string, string>) {
      // Render a test div element to the container given by id
      const container = document.getElementById(miradorConfig.id)
      const miradorMockRoot = document.createElement('div')
      miradorMockRoot.textContent = 'Mirador Mock Root'
      container?.append(miradorMockRoot)

      return miradorInstanceMock
    }),
  }
}
