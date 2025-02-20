export type Listener<T> = (value: T) => void

export interface Observable<T> {
  get: () => T
  set: (value: T) => void
  subscribe: (f: Listener<T>) => () => void
}

export function createObservable<T>(init: T): Observable<T> {
  type Listener = (value: T) => void

  let _value = init
  const listeners: Listener[] = []

  return {
    get() {
      return _value
    },

    set(value) {
      _value = value
      const copy = [...listeners]
      copy.forEach((f) => f(_value))
    },

    subscribe(f) {
      listeners.push(f)
      return function unsubscribe() {
        const i = listeners.indexOf(f)
        listeners.splice(i, 1)
      }
    },
  }
}
