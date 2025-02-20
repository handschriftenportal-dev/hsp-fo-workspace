import { State } from './types'

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

  getJumpToWindowDialogOpen(state: State, areaName?: string) {
    const area = state.areas[areaName || state.currentAreaName]
    return area.jumpToWindowDialogOpen
  },

  getWindowTypeDialogOpen(state: State, areaName?: string) {
    const area = state.areas[areaName || state.currentAreaName]
    return area.windowTypeDialogOpen
  },

  getAnnotation(state: State) {
    return state.annotation
  },
}
