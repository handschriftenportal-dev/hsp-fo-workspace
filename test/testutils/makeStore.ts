import { State } from 'types'

import { createConfiguredStore, reducer } from 'src/contexts/state'

export const makeStore = (preloadedState?: State) =>
  createConfiguredStore(reducer, preloadedState)
