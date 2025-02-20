import { HspThemeProvider } from 'hsp-web-module'
import React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { PersistGate } from 'redux-persist/es/integration/react'

import {
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles'

import { Config, ConfigContext } from './config'
import { EventTargetContext } from './events'
import { MiradorApiContext, MiradorApiStore } from './mirador'
import { State, persistor } from './state'
import { UnitContainers } from './units'

export interface Props {
  children?: React.ReactNode
  store: Store<State>
  config: Required<Config>
  eventTarget: EventTarget
  containers: UnitContainers
  miradorApiStore: MiradorApiStore
}

export function Providers(props: Readonly<Props>) {
  const generateClassName = createGenerateClassName({
    seed: props.config.classNamePrefix,
  })

  return (
    <Provider store={props.store}>
      <PersistGate persistor={persistor}>
        <ConfigContext.Provider value={props.config}>
          <EventTargetContext.Provider value={props.eventTarget}>
            <MiradorApiContext.Provider value={props.miradorApiStore}>
              <StylesProvider generateClassName={generateClassName}>
                <HspThemeProvider themeOptions={props.config.theme}>
                  {props.children}
                </HspThemeProvider>
              </StylesProvider>
            </MiradorApiContext.Provider>
          </EventTargetContext.Provider>
        </ConfigContext.Provider>
      </PersistGate>
    </Provider>
  )
}
