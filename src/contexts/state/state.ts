import { configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storageSession from 'redux-persist/lib/storage/session'

import { reducer } from './reducer'
import { State } from './types'

const persistConfig = {
  key: 'workspace/mirador-areas',
  storage: storageSession,
  stateReconciler: autoMergeLevel2,
  blacklist: ['annotation', 'i18nConfig', 'location'],
}

const persistedReducer = persistReducer<ReturnType<typeof reducer>>(
  persistConfig,
  reducer,
)

const getMiddleware = () => {
  // TODO: this seams a little hacky...
  // needed, because createStore (deprecated) didn't check for serializability
  // see https://stackoverflow.com/q/61704805
  return (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.state.config.export.manifests.filter',
          'payload.state.config.annotation.adapter',
        ],
      },
    })
}

export const createConfiguredStore = (reducer: any, preloadedState?: State) => {
  return configureStore({
    reducer,
    devTools: true,
    preloadedState,
    middleware: getMiddleware(),
  })
}

export const notPersistedStore = createConfiguredStore(reducer)
export const persistedStore = createConfiguredStore(persistedReducer)

export const persistor = persistStore(persistedStore)
