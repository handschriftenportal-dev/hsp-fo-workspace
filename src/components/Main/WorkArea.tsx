import { parse } from 'flatted'
import { WebModuleLanguage } from 'hsp-web-module'
import de from 'locales/de.json'
import en from 'locales/en.json'
import React from 'react'
import { DispatchProp, batch, connect } from 'react-redux'

import { Area, WorkspaceResource, actions } from 'src/contexts/state'
import { deepEqual } from 'src/utils/deepEqual'

import packageJson from '../../../package.json'
import LocalStorageAdapter from './Annotation/LocalStorageAdapter'

// The dispatch property will be provided
// by the `connect` hoc of react-redux.
export interface Props extends DispatchProp {
  annotation: boolean
  area: Area
  onReady?: (Mirador: any, mirador: any) => void
  language: WebModuleLanguage
  fireResourceAddedToMirador: (resource: WorkspaceResource) => boolean
  fireResourceRemovedFromMirador: (resource: WorkspaceResource) => boolean
  fireMiradorResourceUpdated: (resource: WorkspaceResource) => boolean
  hspTeiEndpoint: string
  eventTarget?: EventTarget
  manifestEndpoint: string
  kodEndpoint: string
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
    annototAdapter: LocalStorageAdapter | undefined

    constructor(props: Props) {
      super(props)
      this.initMirador = this.initMirador.bind(this)
      this.syncAreaResourcesIntoMiradorResources =
        this.syncAreaResourcesIntoMiradorResources.bind(this)
      this.syncMiradorResourcesIntoAreaResources =
        this.syncMiradorResourcesIntoAreaResources.bind(this)
      this.annototAdapter = undefined
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
          }),
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
          }),
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
        }),
      )

      if (this.mirador.store.getState()?.texts) {
        this.props.dispatch(
          actions.setMiradorAnnotationTexts({
            annotationText: this.mirador.store.getState().texts,
          }),
        )
      }

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
        mirador.store.getState(),
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
              canvasIndex: resource.canvasIndex,
            }),
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
              }),
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
        mirador.store.getState(),
      ) as string[]
      const resourceIds = Object.keys(area.resources)
      const toAdd = windowIds.filter((id) => resourceIds.indexOf(id) === -1)
      const toRemove = resourceIds.filter((id) => windowIds.indexOf(id) === -1)
      const toUpdate = windowIds.filter((id) => resourceIds.indexOf(id) > -1)

      this.props.dispatch(
        actions.setMiradorSaveState({
          state: this.mirador.store.getState(),
        }),
      )
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
            id,
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
          if (this.props.fireMiradorResourceUpdated(resource)) {
            this.props.dispatch(
              actions.updateResource({
                resource: window.hspWorkspaceResource,
              }),
            )
          }
        })
      })
    }

    createStorageAdapter(canvasId: number) {
      return new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`)
    }

    adapter = (canvasId: number) => this.createStorageAdapter(canvasId)

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
            allowMaximize: false,
            views: [
              { key: 'single', behaviors: ['individuals'] },
              // always display book view
              { key: 'book' },
              { key: 'scroll', behaviors: ['continuous'] },
              { key: 'gallery' },
            ],
          },
        },
        // tei viewer config
        {
          teiEndpoint: this.props.hspTeiEndpoint,
          manifestEndpoint: this.props.manifestEndpoint,
          kodEndpoint: this.props.kodEndpoint,
          eventTarget: this.props.eventTarget,
        },
        // annotation config
        {
          exportLocalStorageAnnotations: true,
          adapter: this.adapter,
          showAnnotations: this.props.annotation,
        },
      )

      this.Mirador = Mirador
      this.mirador = mirador

      if (this.mirador.store.getState()?.config?.annotation) {
        this.annototAdapter =
          this.mirador.store.getState().config.annotation.adapter
      }

      // If we already have a saved mirador state for the
      // current area then inject it into mirador.
      if (this.props.area.miradorSaveState) {
        const serializedState = this.props.area.miradorSaveState
        const deserializedState = parse(serializedState)

        if (deserializedState.config?.annotation) {
          deserializedState.config.annotation.adapter = this.annototAdapter
        }

        mirador.store.dispatch(
          Mirador.actions.importMiradorState(deserializedState),
        )
      }

      // The mirador save state from above may contain an
      // outdated language so we will set the current language.
      mirador.store.dispatch(
        Mirador.actions.updateConfig({
          language: this.props.language,
        }),
      )
      if (this.props.area.annotationText && this.mirador.store.getState()) {
        this.mirador.store.getState().texts = this.props.area.annotationText
      }

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
  },
)
