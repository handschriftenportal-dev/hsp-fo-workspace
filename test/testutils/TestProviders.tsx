import React from 'react'

import { Props as ProviderProps, Providers } from 'src/contexts/Providers'
import { defaultConfig } from 'src/contexts/config'
import { createMiradorApiStore } from 'src/contexts/mirador'
import { defaultState } from 'src/contexts/state'

import { makeStore } from './makeStore'

export function TestProviders(props: Readonly<Partial<ProviderProps>>) {
  const defaultProps: ProviderProps = {
    config: defaultConfig,
    store: makeStore({
      ...defaultState,
      i18nConfig: {
        ...defaultState.i18nConfig,
        disableTranslation: true,
      },
    }),
    eventTarget: new EventTarget(),
    children: null,
    containers: {},
    miradorApiStore: createMiradorApiStore({
      Mirador: undefined,
      mirador: undefined,
    }),
  }

  const effectiveProps = {
    ...defaultProps,
    ...props,
  }

  return <Providers {...effectiveProps}>{props.children}</Providers>
}
