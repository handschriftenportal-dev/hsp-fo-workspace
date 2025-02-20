import { createHspWorkspace } from 'src/HspWorkspace'
import { defaultConfig } from 'src/contexts/config'
import { WorkspaceResource, defaultState } from 'src/contexts/state'

;(global as any).fetch = jest.fn()

test('addEventListener', function (done) {
  const workspace = createHspWorkspace(defaultConfig)
  workspace.addEventListener('linkClicked', (e) => {
    expect(e.detail.href).toBe('http://example.com/foo')
    done()
  })
  workspace.eventTarget.dispatchEvent(
    new CustomEvent('linkClicked', {
      detail: new URL('http://example.com/foo'),
    }),
  )
})

test('addEventListener returns a function to remove listener', function () {
  let counter1 = 0
  let counter2 = 0
  const workspace = createHspWorkspace(defaultConfig)

  function triggerEvent() {
    workspace.eventTarget.dispatchEvent(
      new CustomEvent('linkClicked', {
        detail: new URL('http://example.com/foo'),
      }),
    )
  }

  const removeListener1 = workspace.addEventListener(
    'linkClicked',
    () => counter1++,
  )
  const removeListener2 = workspace.addEventListener(
    'linkClicked',
    () => counter2++,
  )

  triggerEvent()
  expect(counter1).toBe(1)
  expect(counter2).toBe(1)

  removeListener1()
  triggerEvent()
  expect(counter1).toBe(1)
  expect(counter2).toBe(2)

  removeListener2()
  triggerEvent()
  expect(counter1).toBe(1)
  expect(counter2).toBe(2)
})

test('getConfig returns the config values passed to the constructor', function () {
  const config = createHspWorkspace(defaultConfig).getConfig()
  expect(config).toEqual(defaultConfig)
})

test('mount, umount, isMounted', async function () {
  const mainContainer = document.createElement('div')
  document.body.appendChild(mainContainer)
  const workspace = createHspWorkspace(defaultConfig)

  expect(document.getElementById('hsp-workspace-root')).toBeNull()
  expect(workspace.isMounted()).toBe(false)

  await workspace.mount({
    main: mainContainer,
  })
  expect(document.getElementById('hsp-workspace-root')).not.toBeNull()
  expect(document.getElementById('hsp-workspace-main')).not.toBeNull()
  expect(workspace.isMounted()).toBe(true)

  // Nothing should change here because we did not invoke unmount()
  // before we call mount() a second time. So this call should be ignored.
  await workspace.mount({
    main: document.createElement('div'),
  })
  expect(document.getElementById('hsp-workspace-root')).not.toBeNull()
  expect(document.getElementById('hsp-workspace-main')).not.toBeNull()
  expect(workspace.isMounted()).toBe(true)

  workspace.unmount()
  expect(document.getElementById('hsp-workspace-root')).toBeNull()
  expect(document.getElementById('hsp-workspace-main')).toBeNull()
  expect(workspace.isMounted()).toBe(false)

  workspace.unmount()
  // At least one container element must be given
  await expect(workspace.mount({})).rejects.toThrow()
})

describe('Setter', function () {
  test('setState and getState', function () {
    const workspace = createHspWorkspace(defaultConfig)
    expect(workspace.getState()).toEqual(defaultState)
    workspace.setState({ ...defaultState, currentAreaName: 'frank' })
    expect(workspace.getState().currentAreaName).toEqual('frank')
  })

  test('setLocation and getLocation', function () {
    const location = {
      pathname: '/foo',
      search: 'q=bar',
      hash: 'baz',
    }

    const workspace = createHspWorkspace(defaultConfig)
    workspace.setLocation(location)
    expect(workspace.getLocation()).toEqual(location)
  })

  test('setLanguage and getLanguage', function () {
    const workspace = createHspWorkspace(defaultConfig)
    expect(workspace.getLanguage()).toBe('de')
    workspace.setLanguage('en')
    expect(workspace.getLanguage()).toBe('en')
  })
})

describe('Methods', function () {
  test('getResource, addResource and removeResource', function () {
    const manifest: WorkspaceResource = {
      type: 'iiif:manifest',
      id: 'window-foo',
      manifestId: 'foo',
    }
    const description: WorkspaceResource = {
      type: 'hsp:description',
      id: 'window-bar',
      manifestId: 'bar',
    }
    const descriptionRetro: WorkspaceResource = {
      type: 'hsp:description_retro',
      id: 'window-foobar',
      manifestId: 'foobar',
    }
    const workspace = createHspWorkspace(defaultConfig)
    workspace.setState({ ...defaultState })
    expect(workspace.getState()).toEqual(defaultState)

    expect(workspace.getResources()).toEqual([])
    workspace.addResource(manifest)
    expect(workspace.getResources()).toEqual([manifest])
    workspace.addResource(description)
    expect(workspace.getResources()).toEqual([manifest, description])
    workspace.removeResource(manifest)
    expect(workspace.getResources()).toEqual([description])
    workspace.addResource(descriptionRetro)
    expect(workspace.getResources()).toEqual([description, descriptionRetro])
    workspace.removeResource(descriptionRetro)
    expect(workspace.getResources()).toEqual([description])
    workspace.removeResource(description)
    expect(workspace.getResources()).toEqual([])
  })

  test('createArea, deleteArea, getAreaNames, getCurrentAreaName, setCurrenArea', function () {
    const workspace = createHspWorkspace(defaultConfig)

    expect(workspace.getAreaNames()).toEqual(['default'])
    expect(workspace.getCurrentAreaName()).toBe('default')

    workspace.createArea('foo')
    expect(workspace.getAreaNames()).toEqual(['default', 'foo'])
    expect(workspace.getCurrentAreaName()).toBe('default')

    workspace.setCurrentArea('foo')
    expect(workspace.getAreaNames()).toEqual(['default', 'foo'])
    expect(workspace.getCurrentAreaName()).toBe('foo')

    workspace.deleteArea('foo')
    expect(workspace.getAreaNames()).toEqual(['default'])
    expect(workspace.getCurrentAreaName()).toBe('default')
  })

  test('setFullscreen, setWindowType, toggleAlbum, setWindowTypeDialog', function () {
    // The effect of this methods should be tested in an integration test.
    // At this point we simply test for existence.
    expect(createHspWorkspace(defaultConfig).setFullscreen).toBeInstanceOf(
      Function,
    )
    expect(createHspWorkspace(defaultConfig).setWindowType).toBeInstanceOf(
      Function,
    )
    expect(createHspWorkspace(defaultConfig).toggleAlbum).toBeInstanceOf(
      Function,
    )
    expect(
      createHspWorkspace(defaultConfig).setWindowTypeDialogOpen,
    ).toBeInstanceOf(Function)
  })
})
