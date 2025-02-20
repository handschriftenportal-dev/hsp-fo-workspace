import React from 'react'
import { useSelector } from 'react-redux'

import { makeStyles } from '@material-ui/core/styles'

import { Props as ProviderProps } from 'src/contexts/Providers'
import { useConfig } from 'src/contexts/config'
import { useEvent } from 'src/contexts/events'
import { useI18nConfig } from 'src/contexts/i18n'
import { useMiradorApiStore } from 'src/contexts/mirador'
import { selectors } from 'src/contexts/state'

import { JumpToWindowDialog } from './JumpToWindowDialog'
import { WindowTypeDialog } from './WindowTypeDialog'
import { WorkArea } from './WorkArea'

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
  },
}))

export function Main(props: Readonly<ProviderProps>) {
  const cls = useStyles()
  const area = useSelector(selectors.getCurrentArea)
  const annotation = useSelector(selectors.getAnnotation)
  const { hspTeiEndpoint, manifestEndpoint, kodEndpoint } = useConfig()
  const { language } = useI18nConfig()
  const miradorApiStore = useMiradorApiStore()
  const fireResourceAddedToMirador = useEvent('resourceAddedToMirador', true)
  const fireResourceRemovedFromMirador = useEvent(
    'resourceRemovedFromMirador',
    true,
  )
  const fireMiradorResourceUpdated = useEvent('miradorResourceUpdated', true)

  function handleMiradorReady(Mirador: any, mirador: any) {
    // Queue the update so that each component that uses useMiradorApi
    // can register to that update event.
    setTimeout(() => {
      miradorApiStore.set({ Mirador, mirador })
    })
  }

  return (
    <div id="hsp-workspace-main" className={cls.root}>
      <WorkArea
        annotation={annotation}
        area={area}
        onReady={handleMiradorReady}
        language={language}
        fireResourceAddedToMirador={fireResourceAddedToMirador}
        fireResourceRemovedFromMirador={fireResourceRemovedFromMirador}
        fireMiradorResourceUpdated={fireMiradorResourceUpdated}
        hspTeiEndpoint={hspTeiEndpoint}
        kodEndpoint={kodEndpoint}
        manifestEndpoint={manifestEndpoint}
        eventTarget={props.eventTarget}
      />
      <WindowTypeDialog />
      <JumpToWindowDialog />
    </div>
  )
}
