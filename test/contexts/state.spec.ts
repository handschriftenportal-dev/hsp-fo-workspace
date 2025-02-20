import { makeStore } from 'test/testutils/makeStore'

import { actions, defaultState, selectors } from 'src/contexts/state'

test('reducer returns correct default state', function () {
  const store = makeStore()
  expect(store.getState()).toEqual(defaultState)
})

test('setState', function () {
  const store = makeStore()
  const newState = {
    ...defaultState,
    currentAreaName: 'foobar',
  }

  store.dispatch(actions.setState(newState))
  expect(store.getState()).toEqual(newState)
})

test('location', function () {
  const store = makeStore()
  expect(selectors.getLocation(store.getState()).pathname).toBe('/')
  expect(selectors.getLocation(store.getState()).search).toBe('')
  expect(selectors.getLocation(store.getState()).hash).toBe('')
  store.dispatch(
    actions.setLocation({
      pathname: '/foo',
      search: 'q=bar',
      hash: 'baz',
    }),
  )
  expect(selectors.getLocation(store.getState()).pathname).toBe('/foo')
  expect(selectors.getLocation(store.getState()).search).toBe('q=bar')
  expect(selectors.getLocation(store.getState()).hash).toBe('baz')
})

test('i18nConfig', function () {
  const store = makeStore()
  expect(selectors.getI18nConfig(store.getState())).toEqual({
    language: 'de',
    disableTranslation: false,
  })
  store.dispatch(
    actions.setI18nConfig({
      language: 'en',
      disableTranslation: true,
    }),
  )
  expect(selectors.getI18nConfig(store.getState())).toEqual({
    language: 'en',
    disableTranslation: true,
  })
})

test('createArea', function () {
  const store = makeStore()
  store.dispatch(actions.createArea({ areaName: 'foo' }))
  expect(store.getState()).toEqual({
    ...defaultState,
    currentAreaName: 'default',
    areas: {
      default: {
        annotationText: {},
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        jumpToWindowDialogOpen: false,
        windowTypeDialogOpen: false,
      },
      foo: {
        annotationText: {},
        name: 'foo',
        miradorSaveState: undefined,
        resources: {},
        jumpToWindowDialogOpen: false,
        windowTypeDialogOpen: false,
      },
    },
  })
})

test('deleteArea', function () {
  const store = makeStore()
  store.dispatch(actions.createArea({ areaName: 'foo' }))
  store.dispatch(actions.deleteArea({ areaName: 'foo' }))
  expect(store.getState()).toEqual({
    ...defaultState,
    currentAreaName: 'default',
    areas: {
      default: {
        annotationText: {},
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        jumpToWindowDialogOpen: false,
        windowTypeDialogOpen: false,
      },
    },
  })
})

test('setCurrentArea', function () {
  const store = makeStore()
  store.dispatch(actions.setCurrentArea({ areaName: 'foo' }))
  expect(store.getState()).toEqual({
    ...defaultState,
    currentAreaName: 'foo',
    areas: {
      default: {
        annotationText: {},
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        jumpToWindowDialogOpen: false,
        windowTypeDialogOpen: false,
      },
    },
  })
})

test('setWindowTypeDialogOpen', function () {
  const store = makeStore()
  store.dispatch(actions.setWindowTypeDialogOpen({ open: true }))
  expect(store.getState()).toEqual({
    ...defaultState,
    currentAreaName: 'default',
    areas: {
      default: {
        annotationText: {},
        name: 'default',
        miradorSaveState: undefined,
        resources: {},
        jumpToWindowDialogOpen: false,
        windowTypeDialogOpen: true,
      },
    },
  })
})

describe('addResource', function () {
  it('adds a resource to the current area', function () {
    const store = makeStore()
    store.dispatch(
      actions.addResource({
        resource: {
          type: 'hsp:description',
          id: 'hsp-window-desc-1',
          manifestId: 'hsp-desc-1',
        },
      }),
    )

    expect(store.getState()).toEqual({
      ...defaultState,
      currentAreaName: 'default',
      areas: {
        default: {
          annotationText: {},
          name: 'default',
          miradorSaveState: undefined,
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
          resources: {
            'hsp-window-desc-1': {
              type: 'hsp:description',
              id: 'hsp-window-desc-1',
              manifestId: 'hsp-desc-1',
            },
          },
        },
      },
    })
  })

  it(`if the area name has been specified then it saves the resource
    the respective area`, function () {
    const store = makeStore()
    store.dispatch(actions.createArea({ areaName: 'foo' }))
    store.dispatch(
      actions.addResource({
        areaName: 'foo',
        resource: {
          type: 'hsp:description',
          id: 'hsp-window-desc-1',
          manifestId: 'hsp-desc-1',
        },
      }),
    )

    expect(store.getState()).toEqual({
      ...defaultState,
      currentAreaName: 'default',
      areas: {
        default: {
          annotationText: {},
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
        foo: {
          annotationText: {},
          name: 'foo',
          miradorSaveState: undefined,
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
          resources: {
            'hsp-window-desc-1': {
              id: 'hsp-window-desc-1',
              manifestId: 'hsp-desc-1',
              type: 'hsp:description',
            },
          },
        },
      },
    })
  })
})

describe('removeResource', function () {
  it('removes resource from the current area', function () {
    const store = makeStore()
    store.dispatch(
      actions.addResource({
        resource: {
          type: 'hsp:description',
          id: 'hsp-window-desc-1',
          manifestId: 'hsp-desc-1',
        },
      }),
    )

    store.dispatch(
      actions.removeResource({
        resource: {
          type: 'hsp:description',
          id: 'hsp-window-desc-1',
          manifestId: 'hsp-desc-1',
        },
      }),
    )

    expect(store.getState()).toEqual({
      ...defaultState,
      currentAreaName: 'default',
      areas: {
        default: {
          annotationText: {},
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
      },
    })
  })

  it(`if the area name has been specified then remove the resource
    from the respective area`, function () {
    const store = makeStore()
    store.dispatch(actions.createArea({ areaName: 'foo' }))
    store.dispatch(
      actions.addResource({
        areaName: 'foo',
        resource: {
          type: 'hsp:description',
          id: 'hsp-window-desc-1',
          manifestId: 'hsp-desc-1',
        },
      }),
    )

    store.dispatch(
      actions.removeResource({
        areaName: 'foo',
        resource: {
          type: 'hsp:description',
          id: 'hsp-window-desc-1',
          manifestId: 'hsp-desc-1',
        },
      }),
    )

    expect(store.getState()).toEqual({
      ...defaultState,
      currentAreaName: 'default',
      areas: {
        default: {
          annotationText: {},
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
        foo: {
          annotationText: {},
          name: 'foo',
          miradorSaveState: undefined,
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
      },
    })
  })
})

describe('setMiradorSaveState', function () {
  it('sets the mirador state to the current work area', function () {
    const store = makeStore()
    store.dispatch(actions.setMiradorSaveState({ state: 'The State' }))
    expect(store.getState()).toEqual({
      ...defaultState,
      currentAreaName: 'default',
      areas: {
        default: {
          annotationText: {},
          name: 'default',
          miradorSaveState: '["The State"]',
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
      },
    })
  })

  it(`if the area name has been specified the save the state
    to the respective work area`, function () {
    const store = makeStore()
    store.dispatch(actions.createArea({ areaName: 'foo' }))
    store.dispatch(
      actions.setMiradorSaveState({
        areaName: 'foo',
        state: 'The State',
      }),
    )
    expect(store.getState()).toEqual({
      ...defaultState,
      currentAreaName: 'default',
      areas: {
        default: {
          annotationText: {},
          name: 'default',
          miradorSaveState: undefined,
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
        foo: {
          annotationText: {},
          name: 'foo',
          miradorSaveState: '["The State"]',
          resources: {},
          jumpToWindowDialogOpen: false,
          windowTypeDialogOpen: false,
        },
      },
    })
  })
})

test('getJumpToWindowDialogOpen', function () {
  const store = makeStore()
  store.dispatch(actions.setJumpToWindowDialogOpen({ open: true }))
  expect(selectors.getJumpToWindowDialogOpen(store.getState())).toBe(true)
})

test('getWindowTypeDialogOpen', function () {
  const store = makeStore()
  store.dispatch(actions.setWindowTypeDialogOpen({ open: true }))
  expect(selectors.getWindowTypeDialogOpen(store.getState())).toBe(true)
})

test('selectAreaNames', function () {
  const store = makeStore()
  store.dispatch(actions.createArea({ areaName: 'foo' }))
  expect(selectors.getAreaNames(store.getState())).toEqual(['default', 'foo'])
})

test('selectCurrentAreaName', function () {
  const store = makeStore()
  expect(selectors.getCurrentAreaName(store.getState())).toEqual('default')
})

test('selectCurrentArea', function () {
  const store = makeStore()
  expect(selectors.getCurrentArea(store.getState())).toEqual({
    name: 'default',
    annotationText: {},
    miradorSaveState: undefined,
    resources: {},
    jumpToWindowDialogOpen: false,
    windowTypeDialogOpen: false,
  })
})

describe('selectResources', function () {
  it('returns the resources of the current area', function () {
    const store = makeStore()

    store.dispatch(
      actions.addResource({
        resource: {
          type: 'hsp:description',
          id: 'window-desc-1',
          manifestId: 'desc-1',
        },
      }),
    )

    store.dispatch(
      actions.addResource({
        resource: {
          type: 'hsp:description',
          id: 'window-desc-2',
          manifestId: 'desc-2',
        },
      }),
    )

    expect(selectors.getResources(store.getState())).toEqual([
      {
        type: 'hsp:description',
        id: 'window-desc-1',
        manifestId: 'desc-1',
      },
      {
        type: 'hsp:description',
        id: 'window-desc-2',
        manifestId: 'desc-2',
      },
    ])
  })

  it(`if the area name has been specified then it returns
    the resources of the respective area`, function () {
    const store = makeStore()

    store.dispatch(actions.createArea({ areaName: 'foo' }))

    store.dispatch(
      actions.addResource({
        areaName: 'foo',
        resource: {
          type: 'hsp:description',
          id: 'window-desc-1',
          manifestId: 'desc-1',
        },
      }),
    )

    store.dispatch(
      actions.addResource({
        areaName: 'foo',
        resource: {
          type: 'hsp:description',
          id: 'window-desc-2',
          manifestId: 'desc-2',
        },
      }),
    )

    // without area name
    expect(selectors.getResources(store.getState())).toEqual([])

    // with area name
    expect(selectors.getResources(store.getState(), 'foo')).toEqual([
      {
        type: 'hsp:description',
        id: 'window-desc-1',
        manifestId: 'desc-1',
      },
      {
        type: 'hsp:description',
        id: 'window-desc-2',
        manifestId: 'desc-2',
      },
    ])
  })
})
