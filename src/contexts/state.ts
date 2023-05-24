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

import { WebModuleLocation } from 'hsp-web-module'
import { createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createAction, isType, AnyAction } from '../utils/stateUtils'
import { I18nConfig } from './i18n'

/**************************************
 * Types
 **************************************/

export interface State {
  location: WebModuleLocation
  i18nConfig: I18nConfig
  areas: Record<string /* area name */, Area>
  currentAreaName: string
}

type Resources = Record<string /* resource id */, WorkspaceResource>

export interface Area {
  name: string
  miradorSaveState: any
  resources: Resources
  windowTypeDialogOpen: boolean
}

export interface WorkspaceResource {
  type: 'hsp:description' | 'hsp:description_retro' | 'iiif:manifest'
  id: string
  manifestId: string
  query?: string
  permalink?: string
}

/**************************************
 * Selectors
 **************************************/

export const selectors = {
  getLocation(state: State) {
    return state.location
  },

  getI18nConfig(state: State) {
    return state.i18nConfig
  },

  getAreaNames(state: State) {
    return Object.keys(state.areas)
  },

  getCurrentAreaName(state: State) {
    return state.currentAreaName
  },

  getCurrentArea(state: State) {
    return state.areas[state.currentAreaName]
  },

  getResources(state: State, areaName?: string) {
    const area = state.areas[areaName || state.currentAreaName]
    return Object.values(area.resources)
  },

  getWindowTypeDialogOpen(state: State, areaName?: string) {
    const area = state.areas[areaName || state.currentAreaName]
    return area.windowTypeDialogOpen
  },
}

/**************************************
 * Actions
 **************************************/

export const actions = {
  setState: createAction<State>('workspace/SET_STATE'),
  setLocation: createAction<State['location']>('SET_LOCATION'),
  setI18nConfig: createAction<State['i18nConfig']>('SET_I18N_CONFIG'),
  addResource: createAction<{ resource: WorkspaceResource; areaName?: string }>(
    'workspace/ADD_RESOURCE'
  ),
  updateResource: createAction<{
    resource: WorkspaceResource
    areaName?: string
  }>('workspace/UPDATE_RESOURCE'),
  removeResource: createAction<{
    resource: WorkspaceResource
    areaName?: string
  }>('workspace/REMOVE_RESOURCE'),
  removeResources: createAction<{
    manifestId: string
    areaName?: string
  }>('workspace/REMOVE_RESOURCES'),
  setMiradorSaveState: createAction<{ state: any; areaName?: string }>(
    'workspace/SET_MIRADOR_SAVE_STATE'
  ),
  setWindowTypeDialogOpen: createAction<{ open: boolean; areaName?: string }>(
    'workspace/SET_WINDOW_TYPE_DIALOG_OPEN'
  ),
  setCurrentArea: createAction<{ areaName: string }>(
    'workspace/SET_CURRENT_AREA'
  ),
  createArea: createAction<{ areaName: string }>('workspace/CREATE_AREA'),
  deleteArea: createAction<{ areaName: string }>('workspace/DELETE_AREA'),
}

/**************************************
 * Reducer
 **************************************/

export const defaultState: State = {
  location: {
    pathname: '/',
    hash: '',
    search: '',
  },
  i18nConfig: {
    language: 'de',
    disableTranslation: false,
  },
  currentAreaName: 'default',
  areas: {
    default: {
      name: 'default',
      miradorSaveState: undefined,
      resources: {},
      windowTypeDialogOpen: false,
    },
  },
}

export function reducer(state = defaultState, action: AnyAction): State {
  // prevent actions on a non existing area
  if (
    isType(action, actions.addResource) ||
    isType(action, actions.updateResource) ||
    isType(action, actions.removeResource) ||
    isType(action, actions.setMiradorSaveState) ||
    isType(action, actions.setWindowTypeDialogOpen)
  ) {
    const areaName = action.payload.areaName
    if (areaName && !state.areas[areaName]) {
      console.warn(
        'Workspace reducer: Skip attempt to update a non existing work area: ',
        action.type
      )
      return state
    }
  }

  if (isType(action, actions.setState)) {
    return action.payload
  }

  if (isType(action, actions.setLocation)) {
    return { ...state, location: action.payload }
  }

  if (isType(action, actions.setI18nConfig)) {
    return { ...state, i18nConfig: action.payload }
  }

  if (isType(action, actions.addResource)) {
    const areaName = action.payload.areaName || state.currentAreaName
    return {
      ...state,
      areas: {
        ...state.areas,
        [areaName]: {
          ...state.areas[areaName],
          resources: {
            ...state.areas[areaName].resources,
            [action.payload.resource.id]: action.payload.resource,
          },
        },
      },
    }
  }

  if (isType(action, actions.updateResource)) {
    const areaName = action.payload.areaName || state.currentAreaName
    return {
      ...state,
      areas: {
        ...state.areas,
        [areaName]: {
          ...state.areas[areaName],
          resources: {
            ...state.areas[areaName].resources,
            [action.payload.resource.id]: {
              ...state.areas[areaName].resources[action.payload.resource.id],
              ...action.payload.resource,
            },
          },
        },
      },
    }
  }

  if (isType(action, actions.removeResource)) {
    const areaName = action.payload.areaName || state.currentAreaName
    const { [action.payload.resource.id]: drop, ...keep } =
      state.areas[areaName].resources
    return {
      ...state,
      areas: {
        ...state.areas,
        [areaName]: {
          ...state.areas[areaName],
          resources: keep,
        },
      },
    }
  }

  if (isType(action, actions.removeResources)) {
    const areaName = action.payload.areaName || state.currentAreaName
    const manifestId = action.payload.manifestId
    const keep = Object.entries(state.areas[areaName].resources).reduce(
      (
        newResources: Resources,
        [id, resource]: [string, WorkspaceResource]
      ) => {
        if (resource.manifestId !== manifestId) {
          newResources[id] = resource
        }
        return newResources
      },
      {}
    )
    return {
      ...state,
      areas: {
        ...state.areas,
        [areaName]: {
          ...state.areas[areaName],
          resources: keep,
        },
      },
    }
  }

  if (isType(action, actions.setMiradorSaveState)) {
    const areaName = action.payload.areaName || state.currentAreaName
    return {
      ...state,
      areas: {
        ...state.areas,
        [areaName]: {
          ...state.areas[areaName],
          miradorSaveState: action.payload.state,
        },
      },
    }
  }

  if (isType(action, actions.setWindowTypeDialogOpen)) {
    const areaName = action.payload.areaName || state.currentAreaName
    return {
      ...state,
      areas: {
        ...state.areas,
        [areaName]: {
          ...state.areas[areaName],
          windowTypeDialogOpen: action.payload.open,
        },
      },
    }
  }

  if (isType(action, actions.setCurrentArea)) {
    return {
      ...state,
      currentAreaName: action.payload.areaName,
    }
  }

  if (isType(action, actions.createArea)) {
    return {
      ...state,
      areas: {
        ...state.areas,
        [action.payload.areaName]: {
          name: action.payload.areaName,
          miradorSaveState: undefined,
          resources: {},
          windowTypeDialogOpen: false,
        },
      },
    }
  }

  if (isType(action, actions.deleteArea)) {
    const { [action.payload.areaName]: drop, ...keep } = state.areas
    return {
      ...state,
      areas: keep,
      currentAreaName:
        state.currentAreaName === action.payload.areaName
          ? 'default'
          : state.currentAreaName,
    }
  }

  return state
}

export const makeStore = (initialState?: State) =>
  createStore(reducer, initialState, composeWithDevTools())
