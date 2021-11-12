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

import { WebModule } from 'hsp-web-module'
import { makeStore, actions, selectors, State, WorkspaceResource } from './contexts/state'
import { Config, defaultConfig } from './contexts/config'
import { Events } from './contexts/events'
import { createLocationStore } from './contexts/location'
import { createI18nStore } from './contexts/i18n'
import { Unit, UnitContainers } from './contexts/units'
import { createMiradorApiStore } from './contexts/mirador'


export type HspWorkspace = WebModule<Config, State, Events, Unit> & {
  addResource: (resource: WorkspaceResource, areaName?: string) => void;
  removeResource: (resource: WorkspaceResource, areaName?: string) => void;
  getResources: (areaName?: string) => WorkspaceResource[];
  createArea: (areaName: string) => void;
  deleteArea: (areaName: string) => void;
  setCurrentArea: (areaName: string) => void;
  getAreaNames: () => string[];
  getCurrentAreaName: () => string;
  setFullscreen: () => void;
  toggleAlbum: () => void;
  setWindowType: (type: 'mosaic' | 'elastic') => void;
  setWindowTypeDialogOpen: (open: boolean) => void;
}

export type CreateHspWorkspace = (config: Config) => HspWorkspace
export const createHspWorkspace: CreateHspWorkspace = (config) => {

  const fullConfig = { ...defaultConfig, ...config }
  let containers: UnitContainers | undefined
  const eventTarget = new EventTarget()
  const store = makeStore()

  const locationStore = createLocationStore({
    path: '/',
    params: new URLSearchParams(),
    hash: ''
  })

  // initialy set language to 'de'
  const i18nStore = createI18nStore({
    language: 'de',
    disableTranslation: false,
  })

  const miradorApiStore = createMiradorApiStore({
    Mirador: undefined,
    mirador: undefined,
  })

  store.subscribe(() => {
    eventTarget.dispatchEvent(new CustomEvent('stateChanged', {
      detail: store.getState()
    }))
  })

  return {

    /********************************************
     * WebModule API
     ********************************************/

    eventTarget,

    addEventListener(type, listener) {
      eventTarget.addEventListener(type, listener as any)
    },

    getConfig() {
      return fullConfig
    },

    async mount(_containers) {
      if (!containers) {
        containers = _containers
        const { mount } = await import('src/contexts/mouting')
        mount({
          containers,
          store,
          config: fullConfig,
          eventTarget,
          i18nStore,
          locationStore,
          miradorApiStore,
        })
      }
    },

    async unmount() {
      if (containers) {
        const { unmount } = await import('src/contexts/mouting')
        unmount(containers)
        containers = undefined
      }
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
      return locationStore.get()
    },

    setLocation(location) {
      locationStore.set(location)
    },

    getLanguage() {
      return i18nStore.get().language
    },

    setLanguage(lang) {
      i18nStore.set({
        ...i18nStore.get(),
        language: lang
      })
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
        mirador.store.dispatch(
          Mirador.actions.setWorkspaceFullscreen(true))
      }
    },

    toggleAlbum() {
      const { Mirador, mirador } = miradorApiStore.get()
      if (Mirador && mirador) {
        mirador.store.dispatch(
          Mirador.actions.setWorkspaceAddVisibility(
            !mirador.store.getState().workspace.isWorkspaceAddVisible))
      }
    },

    setWindowType(type) {
      const { Mirador, mirador } = miradorApiStore.get()
      if (Mirador && mirador) {
        mirador.store.dispatch(
          Mirador.actions.updateWorkspace({ type }))
      }
    },

    setWindowTypeDialogOpen(open) {
      store.dispatch(actions.setWindowTypeDialogOpen({ open }))
    }
  }
}

// export module constructor to window
const _window = window as any
_window.createHspWorkspace = createHspWorkspace
