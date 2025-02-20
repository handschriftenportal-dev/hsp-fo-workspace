import { createReducer } from '@reduxjs/toolkit'
import { stringify } from 'flatted'
import { State, WorkspaceResource } from 'types'

import { Action } from '../../utils/stateUtils'
import {
  AreaAction,
  RemoveResourcesAction,
  ResourceAction,
  SetMiradorAnnotationStateAction,
  SetMiradorSaveStateAction,
  SetWindowTypeDialogOpenAction,
  actions,
} from './actions'
import { Resources } from './types'

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
  annotation: false,
  areas: {
    default: {
      name: 'default',
      miradorSaveState: undefined,
      resources: {},
      windowTypeDialogOpen: false,
      jumpToWindowDialogOpen: false,
      annotationText: {},
    },
  },
}

function handleAddResource(state: State, action: Action<ResourceAction>) {
  const areaName = action.payload.areaName || state.currentAreaName
  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      resources: {
        ...state.areas[areaName].resources,
        [action.payload.resource.id]: action.payload.resource,
      },
    },
  }
}

function handleDeleteArea(state: State, action: Action<AreaAction>) {
  const keep = { ...state.areas }
  delete keep[action.payload.areaName]
  state.areas = keep
  state.currentAreaName =
    state.currentAreaName === action.payload.areaName
      ? 'default'
      : state.currentAreaName
}

function handleCreateArea(state: State, action: Action<AreaAction>) {
  state.areas = {
    ...state.areas,
    [action.payload.areaName]: {
      name: action.payload.areaName,
      miradorSaveState: undefined,
      resources: {},
      jumpToWindowDialogOpen: false,
      windowTypeDialogOpen: false,
      annotationText: {},
    },
  }
}

function handleSetJumpToWindowDialogOpen(
  state: State,
  action: Action<SetWindowTypeDialogOpenAction>,
) {
  const areaName = action.payload.areaName || state.currentAreaName

  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      jumpToWindowDialogOpen: action.payload.open,
    },
  }
}

function handleSetWindowTypeDialogOpen(
  state: State,
  action: Action<SetWindowTypeDialogOpenAction>,
) {
  const areaName = action.payload.areaName || state.currentAreaName
  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      windowTypeDialogOpen: action.payload.open,
    },
  }
}

function handleSetMiradorSaveState(
  state: State,
  action: Action<SetMiradorSaveStateAction>,
) {
  const areaName = action.payload.areaName || state.currentAreaName
  const serializedState = stringify(action.payload.state)

  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      miradorSaveState: serializedState,
    },
  }
}

function handleSetMiradorAnnotationTexts(
  state: State,
  action: Action<SetMiradorAnnotationStateAction>,
) {
  const areaName = action.payload.areaName || state.currentAreaName
  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      annotationText: action.payload.annotationText,
    },
  }
}

function handleRemoveResources(
  state: State,
  action: Action<RemoveResourcesAction>,
) {
  const areaName = action.payload.areaName || state.currentAreaName
  const manifestId = action.payload.manifestId
  const keep = Object.entries(state.areas[areaName].resources).reduce(
    (newResources: Resources, [id, resource]: [string, WorkspaceResource]) => {
      if (resource.manifestId !== manifestId) {
        newResources[id] = resource
      }
      return newResources
    },
    {},
  )
  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      resources: keep,
    },
  }
}

function handleRemoveResource(state: State, action: Action<ResourceAction>) {
  const areaName = action.payload.areaName || state.currentAreaName
  const keep = { ...state.areas[areaName].resources }
  delete keep[action.payload.resource.id]
  state.areas = {
    ...state.areas,
    [areaName]: {
      ...state.areas[areaName],
      resources: keep,
    },
  }
}

function handleUpdateResource(state: State, action: Action<ResourceAction>) {
  const areaName = action.payload.areaName || state.currentAreaName
  state.areas = {
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
  }
}

export const reducer = createReducer(defaultState, (builder) => {
  builder.addCase(actions.setState, (_state, action) => {
    return action.payload
  })
  builder.addCase(actions.setLocation, (state, action) => {
    state.location = action.payload
  })
  builder.addCase(actions.setI18nConfig, (state, action) => {
    state.i18nConfig = action.payload
  })
  builder.addCase(actions.addAnnotation, (state, action) => {
    state.annotation = action.payload
  })
  builder.addCase(actions.addResource, handleAddResource)

  builder.addCase(actions.updateResource, handleUpdateResource)
  builder.addCase(actions.removeResource, handleRemoveResource)
  builder.addCase(actions.removeResources, handleRemoveResources)
  builder.addCase(actions.setMiradorSaveState, handleSetMiradorSaveState)
  builder.addCase(
    actions.setMiradorAnnotationTexts,
    handleSetMiradorAnnotationTexts,
  )
  builder.addCase(
    actions.setJumpToWindowDialogOpen,
    handleSetJumpToWindowDialogOpen,
  )
  builder.addCase(
    actions.setWindowTypeDialogOpen,
    handleSetWindowTypeDialogOpen,
  )
  builder.addCase(actions.setCurrentArea, (state, action) => {
    state.currentAreaName = action.payload.areaName
  })
  builder.addCase(actions.createArea, handleCreateArea)

  builder.addCase(actions.deleteArea, handleDeleteArea)

  builder.addMatcher(
    (action) =>
      action.type === actions.addResource.type ||
      action.type === actions.updateResource.type ||
      action.type === actions.removeResource.type ||
      action.type === actions.setMiradorSaveState.type ||
      action.type === actions.setJumpToWindowDialogOpen.type,
    (state, action) => {
      const areaName = action.payload.areaName
      if (areaName && !state.areas[areaName]) {
        console.warn(
          'Workspace reducer: Skip attempt to update a non existing work area: ',
          action.type,
        )
        return
      }

      return state
    },
  )
})
