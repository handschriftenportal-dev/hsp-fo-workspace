import { createContext, useContext, useEffect, useState } from 'react'

import { Observable, createObservable } from '../utils/observable'

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

export const MiradorApiContext = createContext(
  createMiradorApiStore({
    Mirador: undefined,
    mirador: undefined,
  }),
)

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
