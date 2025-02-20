import { WebModuleConfig } from 'hsp-web-module'
import { createContext, useContext } from 'react'

import { ThemeOptions } from '@material-ui/core/styles'

export type Config = WebModuleConfig & {
  theme: ThemeOptions
  hspTeiEndpoint: string
  manifestEndpoint: string
  kodEndpoint: string
  persistStore: boolean
}

export const ConfigContext = createContext<Required<Config> | undefined>(
  undefined,
)
export const useConfig = () => useContext(ConfigContext) as Required<Config>

export const defaultConfig: Required<Config> = {
  classNamePrefix: 'hsp-workspace',
  enableRouting: false,
  customFetch: window.fetch,
  createAbsoluteURL({ pathname, search, hash }) {
    const url = new URL(pathname, window.location.origin)
    url.search = search
    url.hash = hash
    return url
  },
  theme: {},
  hspTeiEndpoint: 'http://example.com/api/search',
  manifestEndpoint: 'http://example.com/api/manifest/search',
  kodEndpoint: 'http://example.com/api/kod/search',
  persistStore: true,
}
