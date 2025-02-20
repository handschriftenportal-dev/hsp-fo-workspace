import { WebModuleEvents } from 'hsp-web-module'
import { createContext, useContext } from 'react'

import { State, WorkspaceResource } from './state'

export type Events = WebModuleEvents<State> & {
  // A resource was added to Mirador state by an Mirador UI (e.g. album add button)
  resourceAddedToMirador: CustomEvent<WorkspaceResource>
  // A resource was removed from Mirador state by an Mirador UI (e.g. window close button)
  resourceRemovedFromMirador: CustomEvent<WorkspaceResource>
  // A mirador resource was updated
  miradorResourceUpdated: CustomEvent<WorkspaceResource>
  openResourceInSearchClicked: CustomEvent<{ hspobjectid: string }>
  openAuthorityIdInSearchClicked: CustomEvent<{ authorityfileid: string }>
  miradorWindowSizeChanged: CustomEvent
}

export const EventTargetContext = createContext<EventTarget | undefined>(
  undefined,
)

export const useEventTarget = () =>
  useContext(EventTargetContext) as EventTarget

export function useEvent<N extends keyof Events>(name: N, cancelable = true) {
  const target = useEventTarget()
  return (detail: Events[N]['detail']) =>
    target.dispatchEvent(
      new CustomEvent(name, {
        detail,
        cancelable,
      }),
    )
}
