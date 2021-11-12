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


(global as any).fetch = jest.fn()

import { createHspWorkspace } from 'src/HspWorkspace'
import { defaultState, WorkspaceResource } from 'src/contexts/state'
import { defaultConfig } from 'src/contexts/config'

test('addEventListener', function(done) {
  const workspace = createHspWorkspace(defaultConfig)
  workspace.addEventListener('linkClicked', e => {
    expect(e.detail.href).toBe('http://example.com/foo')
    done()
  })
  workspace.eventTarget.dispatchEvent(
    new CustomEvent('linkClicked', {
      detail: new URL('http://example.com/foo')
    }))
})

test('getConfig returns the config values passed to the constructor', function() {
  const config = createHspWorkspace(defaultConfig).getConfig()
  expect(config).toEqual(defaultConfig)
})

test('mount, umount, isMounted', async function() {
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
    main: null,
  })
  expect(document.getElementById('hsp-workspace-root')).not.toBeNull()
  expect(document.getElementById('hsp-workspace-main')).not.toBeNull()
  expect(workspace.isMounted()).toBe(true)

  await workspace.unmount()
  expect(document.getElementById('hsp-workspace-root')).toBeNull()
  expect(document.getElementById('hsp-workspace-main')).toBeNull()
  expect(workspace.isMounted()).toBe(false)

  await workspace.unmount()
  // At leas one container element must be given
  await expect(workspace.mount({
    main: null,
  })).rejects.toThrow()
})

test('setState and getState', function() {
  const workspace = createHspWorkspace(defaultConfig)
  expect(workspace.getState()).toEqual(defaultState)
  workspace.setState({ ...defaultState, currentAreaName: 'frank' })
  expect(workspace.getState().currentAreaName).toEqual('frank')
})

test('setLocation and getLocation', function() {
  const location = {
    path: '/foo',
    params: new URLSearchParams('q=bar'),
    hash: 'baz',
  }

  const workspace = createHspWorkspace(defaultConfig)
  workspace.setLocation(location)
  expect(workspace.getLocation()).toEqual(location)
})


test('setLanguage and getLanguage', function() {
  const workspace = createHspWorkspace(defaultConfig)
  expect(workspace.getLanguage()).toBe('de')
  workspace.setLanguage('en')
  expect(workspace.getLanguage()).toBe('en')
})

test('methods getResource, addResource and removeResource', function() {
  const manifest: WorkspaceResource = { type: 'iiif:manifest', id: 'foo' }
  const description: WorkspaceResource = { type: 'hsp:description', id: 'bar' }
  const workspace = createHspWorkspace(defaultConfig)

  expect(workspace.getResources()).toEqual([])
  workspace.addResource(manifest)
  expect(workspace.getResources()).toEqual([manifest])
  workspace.addResource(description)
  expect(workspace.getResources()).toEqual([manifest, description])
  workspace.removeResource(manifest)
  expect(workspace.getResources()).toEqual([description])
  workspace.removeResource(description)
  expect(workspace.getResources()).toEqual([])
})

test('methods createArea, deleteArea, getAreaNames, getCurrentAreaName, setCurrenArea', function() {
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

test('method setFullscreen, setWindowType, toggleAlbum, setWindowTypeDialog', function() {
  // The effect of this methods should be tested in an integration test.
  // At this point we simply test for existence.
  expect(createHspWorkspace(defaultConfig).setFullscreen).toBeInstanceOf(Function)
  expect(createHspWorkspace(defaultConfig).setWindowType).toBeInstanceOf(Function)
  expect(createHspWorkspace(defaultConfig).toggleAlbum).toBeInstanceOf(Function)
  expect(createHspWorkspace(defaultConfig).setWindowTypeDialogOpen).toBeInstanceOf(Function)
})



















