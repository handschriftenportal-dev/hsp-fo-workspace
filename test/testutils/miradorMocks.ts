/*
 * MIT License
 *
 * Copyright (c) 2021 Staatsbibliothek zu Berlin - Preußischer Kulturbesitz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */



export function createMiradorInstanceMock() {
  return {
    unmount: jest.fn(),
    store: {
      getState: jest.fn(),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
    }
  }
}

export function createMiradorModuleMock(
  miradorInstanceMock: ReturnType<typeof createMiradorInstanceMock>
) {
  return {
    actions: {
      updateConfig: jest.fn(),
      importMiradorState: jest.fn(),
      addWindow: jest.fn(),
      removeWindow: jest.fn(),
      removeResource: jest.fn(),
      setWorkspaceAddVisibility: jest.fn(),
      setWorkspaceFullscreen: jest.fn(),
      updateWorkspace: jest.fn(),
    },

    selectors: {
      getWindow: jest.fn(),
      getWindowIds: jest.fn(),
    },

    create: jest.fn(function (miradorConfig: any, teiViewerPluginConfig: any) {
      // Render a test div element to the container given by id
      const container = document.getElementById(miradorConfig.id)
      const miradorMockRoot = document.createElement('div')
      miradorMockRoot.textContent = 'Mirador Mock Root'
      container?.append(miradorMockRoot)

      return miradorInstanceMock
    })
  }
}
