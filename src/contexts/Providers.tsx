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

import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import {
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles'
import { State } from './state'
import { ConfigContext, Config } from './config'
import { EventTargetContext } from './events'
import { HspThemeProvider } from 'hsp-web-module'
import { UnitContainers } from './units'
import { MiradorApiStore, MiradorApiContext } from './mirador'

export interface Props {
  children?: React.ReactNode
  store: Store<State>
  config: Required<Config>
  eventTarget: EventTarget
  containers: UnitContainers
  miradorApiStore: MiradorApiStore
}

export function Providers(props: Props) {
  const generateClassName = createGenerateClassName({
    seed: props.config.classNamePrefix,
  })

  return (
    <Provider store={props.store}>
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
    </Provider>
  )
}
