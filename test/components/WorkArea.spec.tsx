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

import React from 'react'
import { render, screen } from '@testing-library/react'
import { WorkArea } from 'src/components/WorkArea'
import { Area } from 'src/contexts/state'
import {
  TestProviders,
  createMiradorModuleMock,
  createMiradorInstanceMock
} from 'test/testutils'


// ********************************************************
test('render <WorkArea/> with a fresh area object', function() {

  const mirador = createMiradorInstanceMock()
  const Mirador = createMiradorModuleMock(mirador)

  Mirador.actions.updateConfig.mockImplementationOnce(() => 'set-config-action')
  Mirador.selectors.getWindowIds.mockImplementationOnce(() => [])
  mirador.store.getState.mockImplementationOnce(() => ({}))

  ; (window as any).HspMirador = Mirador

  const onReady = jest.fn()
  const area: Area = {
    name: 'default',
    miradorSaveState: undefined,
    resources: {},
    windowTypeDialogOpen: false,
  }

  render(
    <TestProviders>
      <WorkArea
        language="de"
        onReady={onReady}
        area={area}
        fireResourceAdded={() => true}
        fireResourceRemoved={() => true}
        hspTeiEndpoint="/api/tei"
      />
    </TestProviders>
  )

  // create a mirador instance
  expect(Mirador.create).toHaveBeenCalled()

  // do not import mirador save state because it's undefined
  expect(Mirador.actions.importMiradorState).not.toHaveBeenCalled()

  // set the language
  expect(Mirador.actions.updateConfig).toHaveBeenCalledWith({ language: 'de' })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('set-config-action')

  // call onReady callback with the mirador module and the mirador instance
  expect(onReady).toHaveBeenLastCalledWith(Mirador, mirador)

  // Mirador was rendered
  screen.getByText('Mirador Mock Root')
})

// ********************************************************
test('render <WorkArea/> with a area object that has a saved mirador state', function() {

  const mirador = createMiradorInstanceMock()
  const Mirador = createMiradorModuleMock(mirador)

  Mirador.actions.importMiradorState.mockImplementationOnce(() => 'import-mirador-state-action')
  Mirador.actions.updateConfig.mockImplementationOnce(() => 'set-config-action')
  Mirador.selectors.getWindowIds.mockImplementationOnce(() => [])
  mirador.store.getState.mockImplementationOnce(() => ({}))

  ; (window as any).HspMirador = Mirador

  const onReady = jest.fn()
  const area: Area = {
    name: 'default',
    miradorSaveState: 'mirador-save-state',
    resources: {},
    windowTypeDialogOpen: false,
  }

  render(
    <TestProviders>
      <WorkArea
        language="de"
        onReady={onReady}
        area={area}
        fireResourceAdded={() => true}
        fireResourceRemoved={() => true}
        hspTeiEndpoint="/api/tei"
      />
    </TestProviders>
  )

  // create a mirador instance
  expect(Mirador.create).toHaveBeenCalled()

  // import the saved mirador state
  expect(Mirador.actions.importMiradorState).toHaveBeenCalledWith('mirador-save-state')
  expect(mirador.store.dispatch).toHaveBeenCalledWith('import-mirador-state-action')

  // set the language
  expect(Mirador.actions.updateConfig).toHaveBeenCalledWith({ language: 'de' })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('set-config-action')

  // call onReady callback with the mirador module and the mirador instance
  expect(onReady).toHaveBeenLastCalledWith(Mirador, mirador)

  screen.getByText('Mirador Mock Root')
})

// ********************************************************
test(`render <WorkArea/> with a area object with resources
  to be added, to be removed and to let untouched`, function() {

  const onReady = jest.fn()
  const area: Area = {
    name: 'default',
    miradorSaveState: undefined,
    windowTypeDialogOpen: false,
    resources: {
      // to be ignored
      'manifest-1': {
        type: 'iiif:manifest',
        id: 'manifest-1'
      },
      // to be added
      'manifest-2': {
        type: 'iiif:manifest',
        id: 'manifest-2'
      },
      // to be added
      'description-1': {
        type: 'hsp:description',
        id: 'description-1'
      }
    }
  }

  const miradorResourceIds = [
    // to be ignored
    'manifest-1',
    // to be removed
    'description-2'
  ]

  const mirador = createMiradorInstanceMock()
  const Mirador = createMiradorModuleMock(mirador)

  Mirador.actions.addWindow.mockImplementationOnce(() => 'add-window-action')
  Mirador.actions.removeWindow.mockImplementationOnce(() => 'remove-window-action')
  Mirador.actions.removeResource.mockImplementation(() => 'remove-resource-action')
  Mirador.actions.updateConfig.mockImplementationOnce(() => 'set-config-action')
  Mirador.selectors.getWindowIds.mockImplementationOnce(() => miradorResourceIds)
  mirador.store.getState.mockImplementationOnce(() => ({}))

  ; (window as any).HspMirador = Mirador

  render(
    <TestProviders>
      <WorkArea
        language="de"
        onReady={onReady}
        area={area}
        fireResourceAdded={() => true}
        fireResourceRemoved={() => true}
        hspTeiEndpoint="/api/tei"
      />
    </TestProviders>
  )

  // create a mirador instance
  expect(Mirador.create).toHaveBeenCalled()

  // do not import mirador save state because it's undefined
  expect(Mirador.actions.importMiradorState).not.toHaveBeenCalled()

  // set the language
  expect(Mirador.actions.updateConfig).toHaveBeenCalledWith({ language: 'de' })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('set-config-action')

  // ignore manifest-1
  expect(Mirador.actions.removeWindow).not.toHaveBeenCalledWith('manifest-1')
  expect(Mirador.actions.addWindow).not.toHaveBeenCalledWith({
    id: 'manifest-1',
    manifestId: 'manifest-1'
  })

  // add manifest-2
  expect(Mirador.actions.addWindow).toHaveBeenCalledWith({
    id: 'manifest-2',
    manifestId: 'manifest-2'
  })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('add-window-action')

  // add description-1
  expect(Mirador.actions.addWindow).toHaveBeenCalledWith({
    id: 'description-1',
    isHspTeiViewerWindow: true,
  })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('add-window-action')

  // remove description-2
  expect(Mirador.actions.removeWindow).toHaveBeenCalledWith('description-2')
  expect(mirador.store.dispatch).toHaveBeenLastCalledWith('remove-window-action')

  // call onReady callback with the mirador module and the mirador instance
  expect(onReady).toHaveBeenLastCalledWith(Mirador, mirador)

  screen.getByText('Mirador Mock Root')
})
