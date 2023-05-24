/*
 * MIT License
 *
 * Copyright (c) 2023 Staatsbibliothek zu Berlin - Preußischer Kulturbesitz
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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import React from 'react'
import { WebModuleLanguage } from 'hsp-web-module'
import { Area, actions, WorkspaceResource } from 'src/contexts/state'
import { connect, DispatchProp, batch } from 'react-redux'
import de from 'locales/de.json'
import en from 'locales/en.json'
import { deepEqual } from 'src/utils/deepEqual'
import packageJson from '../../../package.json'

// The dispatch propertie will be provided
// by the `connect` hoc of react-redux.
export interface Props extends DispatchProp {
  area: Area
  onReady?: (Mirador: any, mirador: any) => void
  language: WebModuleLanguage
  fireResourceAddedToMirador: (resource: WorkspaceResource) => boolean
  fireResourceRemovedFromMirador: (resource: WorkspaceResource) => boolean
  fireMiradorResourceUpdated: (resource: WorkspaceResource) => boolean
  hspTeiEndpoint: string
}

// We use a class component here to work around a issue with unmounting the Mirador viewer:
// The `mirador.unmount` function expects the container element to be connected to the DOM.
// The callback function of the useEffect hook though is called AFTER the elements of the
// component are removed. In constrast the `componentWillUnmount` method is calles BEFORE
// the elements get removed so a call to `mirador.unmount` will work in this method.
//
// The `connect` function provides the component with the redux dispatch function.
//
export const WorkArea = connect()(
  class WorkArea extends React.Component<Props> {
    // This is the Mirador module that is available at the window object
    // as soon as the Mirador script is loaded. It contains the viewer
    // constructor, actions and selectors.
    Mirador: any
    // This is the Mirador instance that is returned by `Mirador.viewer`.
    // It exposses the redux store as a property.
    mirador: any
    // Function to unsubscribe from redux store of mirador.
    unsubscribe: (() => void) | undefined

    constructor(props: Props) {
      super(props)
      this.initMirador = this.initMirador.bind(this)
      this.syncAreaResourcesIntoMiradorResources =
        this.syncAreaResourcesIntoMiradorResources.bind(this)
      this.syncMiradorResourcesIntoAreaResources =
        this.syncMiradorResourcesIntoAreaResources.bind(this)
    }

    /********************************************************
     * Life Cycle Methods
     *******************************************************/

    render() {
      return (
        <div id="mirador" style={{ position: 'relative', height: '100%' }} />
      )
    }

    componentDidMount() {
      // Check if the Mirador script is already loaded.
      if ((window as any).HspMirador) {
        this.initMirador()
      } else {
        const script = document.createElement('script')
        script.src = `/hsp-fo-mirador.js?v=${packageJson.version}`
        script.onload = this.initMirador
        document.body.appendChild(script)
      }
    }

    componentDidUpdate(prevProps: Props) {
      if (!this.Mirador || !this.mirador) {
        return
      }

      const areaHasChanged = prevProps.area.name !== this.props.area.name
      const areaResourcesChanged =
        prevProps.area.resources !== this.props.area.resources
      const langHasChanged = prevProps.language !== this.props.language

      // If the work area was switched by the user we will
      // receive a new Area object via props and have to do
      // the following 4 things:
      if (areaHasChanged) {
        // 1. Save the mirador state of the old area.
        this.props.dispatch(
          actions.setMiradorSaveState({
            state: this.mirador.store.getState(),
            areaName: prevProps.area.name,
          })
        )

        // 2. Unsubscribe from Mirador's redux store.
        this.unsubscribe && this.unsubscribe()

        // 3. Unmount the old Mirador instance
        this.mirador.unmount()

        // 4. Init a new Mirador instance
        this.initMirador()

        return
      }

      if (areaResourcesChanged) {
        this.syncAreaResourcesIntoMiradorResources()
      }

      if (langHasChanged) {
        this.mirador.store.dispatch(
          this.Mirador.actions.updateConfig({
            language: this.props.language,
          })
        )
      }
    }

    componentWillUnmount() {
      if (!this.Mirador || !this.mirador) {
        return
      }

      // Save the mirador state before the mirador viewer gets unmounted.
      this.props.dispatch(
        actions.setMiradorSaveState({
          state: this.mirador.store.getState(),
        })
      )

      // Unsubscribe from Mirador's redux store.
      this.unsubscribe && this.unsubscribe()

      this.mirador.unmount()
    }

    /********************************************************
     * Other
     ********************************************************/

    syncAreaResourcesIntoMiradorResources() {
      const Mirador = this.Mirador
      const mirador = this.mirador
      const area = this.props.area

      const resourceIds = Object.keys(area.resources)
      const windowIds = Mirador.selectors.getWindowIds(
        mirador.store.getState()
      ) as string[]
      const toAdd = resourceIds.filter((id) => windowIds.indexOf(id) === -1)
      const toRemove = windowIds.filter((id) => resourceIds.indexOf(id) === -1)
      const toUpdate = resourceIds.filter((id) => windowIds.indexOf(id) > -1)

      batch(() => {
        toAdd.forEach((id) => {
          const resource = area.resources[id]

          mirador.store.dispatch(
            Mirador.actions.addWindow({
              id: resource.id,
              hspWorkspaceResource: resource,
              manifestId: resource.manifestId,
            })
          )

          // remove resource from mirador catalog list
          mirador.store.dispatch(Mirador.actions.removeResource(resource.id))
          mirador.store.dispatch(Mirador.actions.removeResource(undefined))
        })

        toRemove.forEach((id) => {
          mirador.store.dispatch(Mirador.actions.removeWindow(id))
        })

        toUpdate.forEach((id) => {
          const resource = area.resources[id]
          const window = Mirador.selectors.getWindow(mirador.store.getState(), {
            windowId: id,
          })

          if (!deepEqual(resource, window.hspWorkspaceResource)) {
            mirador.store.dispatch(
              Mirador.actions.updateWindow(id, {
                hspWorkspaceResource: resource,
              })
            )
          }
        })
      })
    }

    // Sync Mirador resources into area resources.
    //
    // Dispatch an event for each resource to be synced.
    // If the event was preventDefault() then do not sync.
    syncMiradorResourcesIntoAreaResources() {
      const Mirador = this.Mirador
      const mirador = this.mirador
      const area = this.props.area

      const windowIds = Mirador.selectors.getWindowIds(
        mirador.store.getState()
      ) as string[]
      const resourceIds = Object.keys(area.resources)
      const toAdd = windowIds.filter((id) => resourceIds.indexOf(id) === -1)
      const toRemove = resourceIds.filter((id) => windowIds.indexOf(id) === -1)
      const toUpdate = windowIds.filter((id) => resourceIds.indexOf(id) > -1)

      batch(() => {
        toAdd.forEach((id) => {
          const window = Mirador.selectors.getWindow(mirador.store.getState(), {
            windowId: id,
          })

          // If the Mirador window was created with the `window.hspWorkspaceResource`
          // then use this resource. Otherwise it is asumed that the window was
          // created by Mirador, meaning the resource is an IIIF-Manifest which
          // we will createn area resource from.
          const resource: WorkspaceResource = window.hspWorkspaceResource || {
            type: 'iiif:manifest',
            manifestId: window.manifestId,
          }

          if (this.props.fireResourceAddedToMirador(resource)) {
            this.props.dispatch(actions.addResource({ resource }))
          }
        })

        toRemove.forEach((id) => {
          const resource = area.resources[id]
          if (this.props.fireResourceRemovedFromMirador(resource)) {
            this.props.dispatch(actions.removeResource({ resource }))
          }
        })

        toUpdate.forEach((id) => {
          const resource = area.resources[id]
          const window = Mirador.selectors.getWindow(mirador.store.getState(), {
            windowId: id,
          })

          if (!deepEqual(resource, window.hspWorkspaceResource)) {
            if (this.props.fireMiradorResourceUpdated(resource)) {
              this.props.dispatch(
                actions.updateResource({
                  resource: window.hspWorkspaceResource,
                })
              )
            }
          }
        })
      })
    }

    initMirador() {
      const Mirador = (window as any).HspMirador
      const mirador = Mirador.create(
        {
          id: 'mirador',
          workspaceControlPanel: {
            enabled: false,
          },
          createGenerateClassNameOptions: {
            seed: 'mirador', // class name prefix
          },
          themes: {
            light: {
              typography: {
                fontFamily:
                  '"Roboto", "Helvetica", "Arial", sans-serif, "Junicode"',
              },
              palette: {
                type: 'light',
                primary: {
                  main: '#d65151',
                  dark: '#9f1c28',
                  light: '#ff827d',
                },
              },
            },
          },
          translations: {
            de: de.m3,
            en: en.m3,
          },
          window: {
            sideBarOpen: true,
            sideBarPanel: 'canvas',
            textOverlay: {
              enabled: true,
              selectable: true,
            },
          },
        },
        // tei viewer config
        {
          teiEndpoint: this.props.hspTeiEndpoint,
        },
        // annotation config
        {
          exportLocalStorageAnnotations: true,
        }
      )

      this.Mirador = Mirador
      this.mirador = mirador

      // If we already have a saved mirador state for the
      // current area then inject it into mirador.
      if (this.props.area.miradorSaveState) {
        mirador.store.dispatch(
          Mirador.actions.importMiradorState(this.props.area.miradorSaveState)
        )
      }

      // The mirador save state from above may contain an
      // outdated language so we will set the current language.
      mirador.store.dispatch(
        Mirador.actions.updateConfig({
          language: this.props.language,
        })
      )

      // Due to user actions in the search page the area's resource
      // list may have been updated while the workspace was not rendered.
      this.syncAreaResourcesIntoMiradorResources()

      // If the user opens or closes windows in Mirador
      // we need to update the area's resource list accordingly.
      this.unsubscribe = mirador.store.subscribe(() => {
        this.syncMiradorResourcesIntoAreaResources()
      })

      if (this.props.onReady) {
        this.props.onReady(Mirador, mirador)
      }
    }
  }
)
