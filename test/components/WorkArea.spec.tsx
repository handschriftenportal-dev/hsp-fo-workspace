import { render, screen } from '@testing-library/react'
import React from 'react'
import {
  TestProviders,
  createMiradorInstanceMock,
  createMiradorModuleMock,
} from 'test/testutils'

import { WorkArea } from 'src/components/Main/WorkArea'
import { Area } from 'src/contexts/state'

test('render <WorkArea/> with a fresh area object', function () {
  const mirador = createMiradorInstanceMock()
  const Mirador = createMiradorModuleMock(mirador)

  Mirador.actions.updateConfig.mockImplementationOnce(() => 'set-config-action')
  Mirador.selectors.getWindowIds.mockImplementationOnce(() => [])
  mirador.store.getState.mockImplementationOnce(() => ({}))
  ;(window as any).HspMirador = Mirador

  const onReady = jest.fn()
  const area: Area = {
    name: 'default',
    miradorSaveState: undefined,
    resources: {},
    jumpToWindowDialogOpen: false,
    windowTypeDialogOpen: false,
    annotationText: {},
  }

  render(
    <TestProviders>
      <WorkArea
        annotation={true}
        language="de"
        onReady={onReady}
        area={area}
        fireResourceAddedToMirador={() => true}
        fireResourceRemovedFromMirador={() => true}
        fireMiradorResourceUpdated={() => true}
        hspTeiEndpoint="/api/tei"
        manifestEndpoint="/api/digitized"
        kodEndpoint="/api/kod"
      />
    </TestProviders>,
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
test('render <WorkArea/> with a area object that has a saved mirador state', function () {
  const mirador = createMiradorInstanceMock()
  const Mirador = createMiradorModuleMock(mirador)

  Mirador.actions.importMiradorState.mockImplementationOnce(
    () => 'import-mirador-state-action',
  )
  Mirador.actions.updateConfig.mockImplementationOnce(() => 'set-config-action')
  Mirador.selectors.getWindowIds.mockImplementationOnce(() => [])
  mirador.store.getState.mockImplementationOnce(() => ({}))
  ;(window as any).HspMirador = Mirador

  const onReady = jest.fn()
  const area: Area = {
    name: 'default',
    miradorSaveState: '["mirador-save-state"]',
    resources: {},
    jumpToWindowDialogOpen: false,
    windowTypeDialogOpen: false,
    annotationText: {},
  }

  render(
    <TestProviders>
      <WorkArea
        annotation={true}
        language="de"
        onReady={onReady}
        area={area}
        fireResourceAddedToMirador={() => true}
        fireResourceRemovedFromMirador={() => true}
        fireMiradorResourceUpdated={() => true}
        hspTeiEndpoint="/api/tei"
        manifestEndpoint="/api/digitized"
        kodEndpoint="/api/kod"
      />
    </TestProviders>,
  )

  // create a mirador instance
  expect(Mirador.create).toHaveBeenCalled()

  // import the saved mirador state
  expect(Mirador.actions.importMiradorState).toHaveBeenCalledWith(
    'mirador-save-state',
  )
  expect(mirador.store.dispatch).toHaveBeenCalledWith(
    'import-mirador-state-action',
  )

  // set the language
  expect(Mirador.actions.updateConfig).toHaveBeenCalledWith({ language: 'de' })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('set-config-action')

  // call onReady callback with the mirador module and the mirador instance
  expect(onReady).toHaveBeenLastCalledWith(Mirador, mirador)

  screen.getByText('Mirador Mock Root')
})

// ********************************************************
test(`render <WorkArea/> with a area object with resources
  to be added, to be removed`, function () {
  const onReady = jest.fn()
  const area: Area = {
    name: 'default',
    miradorSaveState: undefined,
    jumpToWindowDialogOpen: false,
    windowTypeDialogOpen: false,
    annotationText: {},
    resources: {
      // to be added
      'manifest-2': {
        type: 'iiif:manifest',
        id: 'manifest-2',
        manifestId: 'manifest-2',
      },
      // to be added
      'description-1': {
        type: 'hsp:description',
        id: 'description-1',
        manifestId: 'description-1',
      },
    },
  }

  const miradorResourceIds = [
    // to be removed
    'description-2',
  ]

  const mirador = createMiradorInstanceMock()
  const Mirador = createMiradorModuleMock(mirador)

  Mirador.actions.addWindow.mockImplementationOnce(() => 'add-window-action')
  Mirador.actions.removeWindow.mockImplementationOnce(
    () => 'remove-window-action',
  )
  Mirador.actions.removeResource.mockImplementation(
    () => 'remove-resource-action',
  )
  Mirador.actions.updateConfig.mockImplementationOnce(() => 'set-config-action')
  Mirador.selectors.getWindowIds.mockImplementationOnce(
    () => miradorResourceIds,
  )
  mirador.store.getState.mockImplementationOnce(() => ({}))
  ;(window as any).HspMirador = Mirador

  render(
    <TestProviders>
      <WorkArea
        annotation={true}
        language="de"
        onReady={onReady}
        area={area}
        fireResourceAddedToMirador={() => true}
        fireResourceRemovedFromMirador={() => true}
        fireMiradorResourceUpdated={() => true}
        hspTeiEndpoint="/api/tei"
        manifestEndpoint="/api/digitized"
        kodEndpoint="/api/kod"
      />
    </TestProviders>,
  )

  // create a mirador instance
  expect(Mirador.create).toHaveBeenCalled()

  // do not import mirador save state because it's undefined
  expect(Mirador.actions.importMiradorState).not.toHaveBeenCalled()

  // set the language
  expect(Mirador.actions.updateConfig).toHaveBeenCalledWith({ language: 'de' })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('set-config-action')

  // add manifest-2
  expect(Mirador.actions.addWindow).toHaveBeenCalledWith({
    id: 'manifest-2',
    manifestId: 'manifest-2',
    hspWorkspaceResource: {
      type: 'iiif:manifest',
      id: 'manifest-2',
      manifestId: 'manifest-2',
    },
  })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('add-window-action')

  // add description-1
  expect(Mirador.actions.addWindow).toHaveBeenCalledWith({
    id: 'description-1',
    manifestId: 'description-1',
    hspWorkspaceResource: {
      type: 'hsp:description',
      id: 'description-1',
      manifestId: 'description-1',
    },
  })
  expect(mirador.store.dispatch).toHaveBeenCalledWith('add-window-action')

  // remove description-2
  expect(Mirador.actions.removeWindow).toHaveBeenCalledWith('description-2')
  expect(mirador.store.dispatch).toHaveBeenCalledWith('remove-window-action')

  // call onReady callback with the mirador module and the mirador instance
  expect(onReady).toHaveBeenLastCalledWith(Mirador, mirador)

  screen.getByText('Mirador Mock Root')
})
