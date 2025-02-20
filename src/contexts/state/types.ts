import { WebModuleLocation } from 'hsp-web-module'

import { I18nConfig } from '../i18n'

export interface State {
  location: WebModuleLocation
  i18nConfig: I18nConfig
  areas: Record<string /* area name */, Area>
  currentAreaName: string
  annotation: boolean
}

export type Resources = Record<string /* resource id */, WorkspaceResource>

export interface Area {
  name: string
  miradorSaveState: any
  resources: Resources
  jumpToWindowDialogOpen: boolean
  windowTypeDialogOpen: boolean
  annotationText: any
}

export interface WorkspaceResource {
  type: 'hsp:description' | 'hsp:description_retro' | 'iiif:manifest'
  id: string
  manifestId?: string
  kodId?: string
  query?: string
  permalink?: string
  canvasIndex?: number
}
