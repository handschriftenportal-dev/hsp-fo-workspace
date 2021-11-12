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

import { createContext, useContext, useEffect, useState } from 'react'
import { createObservable, Observable } from '../utils/observable'

export interface MiradorApi {
  // The Mirador module that contains actions and selectors
  Mirador: any
  // The current Mirador instance that contains the redux store.
  mirador: any
}

export type MiradorApiStore = Observable<MiradorApi>

export const createMiradorApiStore = (api: MiradorApi): MiradorApiStore => {
  return createObservable(api)
}

export const MiradorApiContext = createContext(createMiradorApiStore({
  Mirador: undefined,
  mirador: undefined
}))

export function useMiradorApiStore() {
  return useContext(MiradorApiContext)
}

// Returns the Mirador API
// It updates each time someone sets the API.
// This may happen if the work area changes and a new mirador instance must be set.
export function useMiradorApi() {
  const miradorApiStore = useMiradorApiStore()
  const [api, setApi] = useState(miradorApiStore.get())

  useEffect(() => {
    return miradorApiStore.subscribe(setApi)
  }, [])

  return api
}
