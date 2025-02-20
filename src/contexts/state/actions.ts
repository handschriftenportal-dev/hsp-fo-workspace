import { createAction } from '../../utils/stateUtils'
import { State, WorkspaceResource } from './types'

export type ResourceAction = { resource: WorkspaceResource; areaName?: string }
export type RemoveResourcesAction = { manifestId: string; areaName?: string }
export type SetMiradorSaveStateAction = { state: any; areaName?: string }
export type SetJumpToWindowOpenAction = { open: boolean; areaName?: string }
export type SetWindowTypeDialogOpenAction = { open: boolean; areaName?: string }
export type SetMiradorAnnotationStateAction = {
  annotationText: any
  areaName?: string
}
export type AreaAction = { areaName: string }

export const actions = {
  setState: createAction<State>('workspace/SET_STATE'),
  setLocation: createAction<State['location']>('SET_LOCATION'),
  setI18nConfig: createAction<State['i18nConfig']>('SET_I18N_CONFIG'),
  addResource: createAction<ResourceAction>('workspace/ADD_RESOURCE'),
  updateResource: createAction<ResourceAction>('workspace/UPDATE_RESOURCE'),
  removeResource: createAction<ResourceAction>('workspace/REMOVE_RESOURCE'),
  removeResources: createAction<RemoveResourcesAction>(
    'workspace/REMOVE_RESOURCES',
  ),
  setMiradorSaveState: createAction<SetMiradorSaveStateAction>(
    'workspace/SET_MIRADOR_SAVE_STATE',
  ),
  setMiradorAnnotationTexts: createAction<SetMiradorAnnotationStateAction>(
    'workspace/SAVE_ANNOTATION_TEXTS',
  ),
  setJumpToWindowDialogOpen: createAction<SetJumpToWindowOpenAction>(
    'workspace/SET_JUMP_TO_WINDOW_DIALOG_OPEN',
  ),
  setWindowTypeDialogOpen: createAction<SetWindowTypeDialogOpenAction>(
    'workspace/SET_WINDOW_TYPE_DIALOG_OPEN',
  ),
  setCurrentArea: createAction<AreaAction>('workspace/SET_CURRENT_AREA'),
  addAnnotation: createAction<State['annotation']>('workspace/ADD_ANNOTATION'),
  createArea: createAction<AreaAction>('workspace/CREATE_AREA'),
  deleteArea: createAction<AreaAction>('workspace/DELETE_AREA'),
}
