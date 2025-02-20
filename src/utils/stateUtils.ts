export interface AnyAction {
  type: string
}

export interface Action<P> {
  type: string
  payload: P
}

export interface ActionCreator<P> {
  (payload: P): Action<P>
  type: string
}

export function createAction<P = void>(type: string): ActionCreator<P> {
  function actionCreator(payload: P) {
    return {
      type,
      payload,
    }
  }
  actionCreator.type = type
  return actionCreator
}
