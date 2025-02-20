import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore'
import { WebModule } from 'hsp-web-module'
import { AnyAction } from 'redux'

import { Config, defaultConfig } from './contexts/config'
import { Events } from './contexts/events'
import { createMiradorApiStore } from './contexts/mirador'
import { route } from './contexts/route'
import {
  State,
  WorkspaceResource,
  actions,
  notPersistedStore,
  persistedStore,
  selectors,
} from './contexts/state'
import { Unit, UnitContainers } from './contexts/units'

export type HspWorkspace = WebModule<Config, State, Events, Unit> & {
  addResource: (resource: WorkspaceResource, areaName?: string) => void
  removeResource: (resource: WorkspaceResource, areaName?: string) => void
  removeResources: (manifestId: string, areaName?: string) => void
  getResources: (areaName?: string) => WorkspaceResource[]
  createArea: (areaName: string) => void
  deleteArea: (areaName: string) => void
  setCurrentArea: (areaName: string) => void
  getAreaNames: () => string[]
  getCurrentAreaName: () => string
  setFullscreen: () => void
  toggleAlbum: () => void
  setJumpToWindowDialogOpen: (open: boolean) => void
  addAnnotation: (show: boolean) => void
  getAnnotation: () => boolean
  setWindowType: (type: 'mosaic' | 'elastic') => void
  setWindowTypeDialogOpen: (open: boolean) => void
}

function HspWorkspace(config: Config): HspWorkspace {
  const fullConfig = { ...defaultConfig, ...config }
  let store: ToolkitStore<any, AnyAction, any>
  let containers: UnitContainers | undefined
  let internalUnmount: ((containers: UnitContainers) => boolean) | undefined
  const eventTarget = new EventTarget()

  const miradorApiStore = createMiradorApiStore({
    Mirador: undefined,
    mirador: undefined,
  })

  if (fullConfig.persistStore) {
    store = persistedStore
  } else {
    store = notPersistedStore
  }

  store.subscribe(() => {
    eventTarget.dispatchEvent(
      new CustomEvent('stateChanged', {
        detail: store.getState(),
      }),
    )
  })

  return {
    /********************************************
     * WebModule API
     ********************************************/

    eventTarget,

    addEventListener(type, listener) {
      eventTarget.addEventListener(type, listener as EventListener)
      return () => {
        eventTarget.removeEventListener(type, listener as EventListener)
      }
    },

    getConfig() {
      return fullConfig
    },

    async mount(_containers) {
      if (!containers) {
        containers = _containers
        const { mount, unmount } = await import('src/contexts/mounting')
        internalUnmount = unmount
        mount({
          containers,
          store,
          config: fullConfig,
          eventTarget,
          miradorApiStore,
        })
      }
    },

    unmount() {
      if (internalUnmount && containers) {
        const result = internalUnmount(containers)
        containers = undefined
        return result
      }
      return false
    },

    isMounted() {
      return !!containers
    },

    getState() {
      return store.getState()
    },

    setState(state) {
      store.dispatch(actions.setState(state))
    },

    getLocation() {
      return selectors.getLocation(store.getState())
    },

    setLocation(location) {
      store.dispatch(actions.setLocation(location))
    },

    getLanguage() {
      return selectors.getI18nConfig(store.getState()).language
    },

    setLanguage(language) {
      const config = selectors.getI18nConfig(store.getState())
      store.dispatch(
        actions.setI18nConfig({
          ...config,
          language,
        }),
      )
    },

    /********************************************
     * Workspace specific API
     ********************************************/

    addResource(resource, areaName) {
      store.dispatch(actions.addResource({ resource, areaName }))
    },

    removeResource(resource, areaName) {
      store.dispatch(actions.removeResource({ resource, areaName }))
    },

    removeResources(manifestId, areaName) {
      store.dispatch(actions.removeResources({ manifestId, areaName }))
    },

    getResources(areaName) {
      return selectors.getResources(store.getState(), areaName)
    },

    createArea(areaName) {
      store.dispatch(actions.createArea({ areaName }))
    },

    deleteArea(areaName) {
      store.dispatch(actions.deleteArea({ areaName }))
    },

    setCurrentArea(areaName) {
      store.dispatch(actions.setCurrentArea({ areaName }))
    },

    getAreaNames() {
      return selectors.getAreaNames(store.getState())
    },

    getCurrentAreaName() {
      return selectors.getCurrentAreaName(store.getState())
    },

    setFullscreen() {
      const { Mirador, mirador } = miradorApiStore.get()
      if (Mirador && mirador) {
        mirador.store.dispatch(Mirador.actions.setWorkspaceFullscreen(true))
      }
    },

    toggleAlbum() {
      const { Mirador, mirador } = miradorApiStore.get()
      if (Mirador && mirador) {
        mirador.store.dispatch(
          Mirador.actions.setWorkspaceAddVisibility(
            !mirador.store.getState().workspace.isWorkspaceAddVisible,
          ),
        )
      }
    },

    setJumpToWindowDialogOpen(open) {
      store.dispatch(actions.setJumpToWindowDialogOpen({ open }))
    },

    addAnnotation(show) {
      store.dispatch(actions.addAnnotation(show))
    },

    getAnnotation() {
      return selectors.getAnnotation(store.getState())
    },

    setWindowType(type) {
      const { Mirador, mirador } = miradorApiStore.get()
      if (Mirador && mirador) {
        mirador.store.dispatch(Mirador.actions.updateWorkspace({ type }))
      }
    },

    setWindowTypeDialogOpen(open) {
      store.dispatch(actions.setWindowTypeDialogOpen({ open }))
    },
  }
}

/**
 * Module factory function
 */

export type CreateHspWorkspace = (config: Config) => HspWorkspace

export const createHspWorkspace: CreateHspWorkspace = (config) => {
  const workspace = HspWorkspace(config)
  if (config.enableRouting) {
    route(workspace)
  }
  return workspace
}

// export module factory to window
;(window as any).createHspWorkspace = createHspWorkspace
