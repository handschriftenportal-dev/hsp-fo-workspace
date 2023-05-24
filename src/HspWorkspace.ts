/*
 * MIT License
 *
 * Copyright (c) 2023 Staatsbibliothek zu Berlin - Preußischer Kulturbesitz
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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { WebModule } from 'hsp-web-module'
import {
  makeStore,
  actions,
  selectors,
  State,
  WorkspaceResource,
} from './contexts/state'
import { Config, defaultConfig } from './contexts/config'
import { Events } from './contexts/events'
import { Unit, UnitContainers } from './contexts/units'
import { createMiradorApiStore } from './contexts/mirador'
import { route } from './contexts/route'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

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
  setWindowType: (type: 'mosaic' | 'elastic') => void
  setWindowTypeDialogOpen: (open: boolean) => void
}

function HspWorkspace(config: Config): HspWorkspace {
  const fullConfig = { ...defaultConfig, ...config }
  let containers: UnitContainers | undefined
  let internalUnmount: ((containers: UnitContainers) => boolean) | undefined
  const eventTarget = new EventTarget()
  const store = makeStore()

  const miradorApiStore = createMiradorApiStore({
    Mirador: undefined,
    mirador: undefined,
  })

  store.subscribe(() => {
    eventTarget.dispatchEvent(
      new CustomEvent('stateChanged', {
        detail: store.getState(),
      })
    )
  })

  return {
    /********************************************
     * WebModule API
     ********************************************/

    eventTarget,

    addEventListener(type, listener) {
      eventTarget.addEventListener(type, listener as any)
      return () => {
        eventTarget.removeEventListener(type, listener as any)
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
        })
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
            !mirador.store.getState().workspace.isWorkspaceAddVisible
          )
        )
      }
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
