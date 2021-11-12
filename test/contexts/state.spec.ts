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

import { createStore } from 'redux'
import {
  reducer,
  actions,
  selectors,
  defaultState,
  State
} from 'src/contexts/state'

test('reducer returns correct default state', function() {
  const store = createStore(reducer)
  expect(store.getState()).toEqual(defaultState)
})

test('setState', function() {
  const store = createStore(reducer)
  const newState = {
    ...defaultState,
    currentAreaName: 'foobar',
  }

  store.dispatch(actions.setState(newState))
  expect(store.getState()).toEqual(newState)
})

test('createArea', function() {
  const store = createStore(reducer)
  store.dispatch(actions.createArea({ areaName: 'foo' }))
  expect(store.getState()).toEqual({
    currentAreaName: 'default',
    areas: {
      default: {
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        windowTypeDialogOpen: false,
      },
      foo: {
        name: 'foo',
        miradorSaveState: undefined,
        resources: {},
        windowTypeDialogOpen: false,
      }
    }
  })
})

test('deleteArea', function() {
  const store = createStore(reducer)
  store.dispatch(actions.createArea({ areaName: 'foo' }))
  store.dispatch(actions.deleteArea({ areaName: 'foo' }))
  expect(store.getState()).toEqual({
    currentAreaName: 'default',
    areas: {
      default: {
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        windowTypeDialogOpen: false,
      }
    }
  })
})

test('setCurrentArea', function() {
  const store = createStore(reducer)
  store.dispatch(actions.setCurrentArea({ areaName: 'foo' }))
  expect(store.getState()).toEqual({
    currentAreaName: 'foo',
    areas: {
      default: {
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        windowTypeDialogOpen: false,
      }
    }
  })
})

test('setWindowTypeDialogOpen', function() {
  const store = createStore(reducer)
  store.dispatch(actions.setWindowTypeDialogOpen({ open: true }))
  expect(store.getState()).toEqual({
    currentAreaName: 'default',
    areas: {
      default: {
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        windowTypeDialogOpen: true,
      }
    }
  })
})

describe('addResource', function() {
  it('adds a resource to the current area', function() {
    const store = createStore(reducer)
    store.dispatch(actions.addResource({
      resource: {
        type: 'hsp:description',
        id: 'hsp-desc-1'
      }
    }))

    expect(store.getState()).toEqual({
      currentAreaName: 'default',
      areas: {
        default: {
          name: 'default',
          miradorSaveState: undefined,
          windowTypeDialogOpen: false,
          resources: {
            'hsp-desc-1': {
              type: 'hsp:description',
              id: 'hsp-desc-1'
            }
          }
        }
      }
    })
  })

  it(`if the area name has been specified then it saves the resource
    the respective area`, function() {
    const store = createStore(reducer)
    store.dispatch(actions.createArea({ areaName: 'foo' }))
    store.dispatch(actions.addResource({
      areaName: 'foo',
      resource: {
        type: 'hsp:description',
        id: 'hsp-desc-1'
      }
    }))

    expect(store.getState()).toEqual({
      currentAreaName: 'default',
      areas: {
        default: {
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          windowTypeDialogOpen: false,
        },
        foo: {
          name: 'foo',
          miradorSaveState: undefined,
          windowTypeDialogOpen: false,
          resources: {
            'hsp-desc-1': {
              type: 'hsp:description',
              id: 'hsp-desc-1'
            }
          }
        }
      }
    })
  })
})

describe('removeResource', function() {
  it('removes resource from the current area', function() {
    const store = createStore(reducer)
    store.dispatch(actions.addResource({
      resource: {
        type: 'hsp:description',
        id: 'hsp-desc-1'
      }
    }))

    store.dispatch(actions.removeResource({
      resource: {
        type: 'hsp:description',
        id: 'hsp-desc-1'
      }
    }))

    expect(store.getState()).toEqual({
      currentAreaName: 'default',
      areas: {
        default: {
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          windowTypeDialogOpen: false,
        }
      }
    })
  })

  it(`if the area name has been specified then remove the resource
    from the respective area`, function() {
    const store = createStore(reducer)
    store.dispatch(actions.createArea({ areaName: 'foo' }))
    store.dispatch(actions.addResource({
      areaName: 'foo',
      resource: {
        type: 'hsp:description',
        id: 'hsp-desc-1'
      }
    }))

    store.dispatch(actions.removeResource({
      areaName: 'foo',
      resource: {
        type: 'hsp:description',
        id: 'hsp-desc-1'
      }
    }))

    expect(store.getState()).toEqual({
      currentAreaName: 'default',
      areas: {
        default: {
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          windowTypeDialogOpen: false,
        },
        foo: {
          name: 'foo',
          miradorSaveState: undefined,
          resources: {},
          windowTypeDialogOpen: false,
        }
      }
    })
  })
})

describe('setMiradorSaveState', function() {
  it('sets the mirador state to the current work area', function() {
    const store = createStore(reducer)
    store.dispatch(actions.setMiradorSaveState({ state: 'The State' }))
    expect(store.getState()).toEqual({
      currentAreaName: 'default',
      areas: {
        default: {
          name: 'default',
          miradorSaveState: 'The State',
          resources: {},
          windowTypeDialogOpen: false,
        }
      }
    })
  })

  it(`if the area name has been specified the save the state
    to the respective work area`, function() {
    const store = createStore(reducer)
    store.dispatch(actions.createArea({ areaName: 'foo' }))
    store.dispatch(actions.setMiradorSaveState({
      areaName: 'foo',
      state: 'The State'
    }))
    expect(store.getState()).toEqual({
      currentAreaName: 'default',
      areas: {
        default: {
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          windowTypeDialogOpen: false,
        },
        foo: {
          name: 'foo',
          miradorSaveState: 'The State',
          resources: {},
          windowTypeDialogOpen: false,
        }
      }
    })
  })
})

test('getWindowTypeDialogOpen', function() {
  const store = createStore(reducer)
  store.dispatch(actions.setWindowTypeDialogOpen({ open: true }))
  expect(selectors.getWindowTypeDialogOpen(store.getState())).toBe(true)
})

test('selectAreaNames', function() {
  const store = createStore(reducer)
  store.dispatch(actions.createArea({ areaName: 'foo' }))
  expect(selectors.getAreaNames(store.getState())).toEqual(['default', 'foo'])
})

test('selectCurrentAreaName', function() {
  const store = createStore(reducer)
  expect(selectors.getCurrentAreaName(store.getState())).toEqual('default')
})

test('selectCurrentArea', function() {
  const store = createStore(reducer)
  expect(selectors.getCurrentArea(store.getState())).toEqual({
    name: 'default',
    miradorSaveState: undefined,
    resources: {},
    windowTypeDialogOpen: false
  })
})

describe('selectResources', function() {
  it('returns the resources of the current area', function() {
    const store = createStore(reducer)

    store.dispatch(actions.addResource({
      resource: { type: 'hsp:description', id: 'desc-1' }
    }))

    store.dispatch(actions.addResource({
      resource: { type: 'hsp:description', id: 'desc-2' }
    }))

    expect(selectors.getResources(store.getState())).toEqual([
      { type: 'hsp:description', id: 'desc-1' },
      { type: 'hsp:description', id: 'desc-2' },
    ])
  })

  it(`if the area name has been specified then it returns
    the resources of the respective area`, function() {
    const store = createStore(reducer)

    store.dispatch(actions.createArea({ areaName: 'foo' }))

    store.dispatch(actions.addResource({
      areaName: 'foo',
      resource: { type: 'hsp:description', id: 'desc-1' }
    }))

    store.dispatch(actions.addResource({
      areaName: 'foo',
      resource: { type: 'hsp:description', id: 'desc-2' }
    }))

    // without area name
    expect(selectors.getResources(store.getState())).toEqual([])

    // with area name
    expect(selectors.getResources(store.getState(), 'foo')).toEqual([
      { type: 'hsp:description', id: 'desc-1' },
      { type: 'hsp:description', id: 'desc-2' },
    ])
  })
})
