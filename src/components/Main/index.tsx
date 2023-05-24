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
import { makeStyles } from '@material-ui/core/styles'
import { selectors } from 'src/contexts/state'
import { useSelector } from 'react-redux'
import { WindowTypeDialog } from './WindowTypeDialog'
import { WorkArea } from './WorkArea'
import { useI18nConfig } from 'src/contexts/i18n'
import { useEvent } from 'src/contexts/events'
import { useMiradorApiStore } from 'src/contexts/mirador'
import { useConfig } from 'src/contexts/config'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
}))

export function Main() {
  const cls = useStyles()
  const area = useSelector(selectors.getCurrentArea)
  const { hspTeiEndpoint } = useConfig()
  const { language } = useI18nConfig()
  const miradorApiStore = useMiradorApiStore()
  const fireResourceAddedToMirador = useEvent('resourceAddedToMirador', true)
  const fireResourceRemovedFromMirador = useEvent(
    'resourceRemovedFromMirador',
    true
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
        area={area}
        onReady={handleMiradorReady}
        language={language}
        fireResourceAddedToMirador={fireResourceAddedToMirador}
        fireResourceRemovedFromMirador={fireResourceRemovedFromMirador}
        fireMiradorResourceUpdated={fireMiradorResourceUpdated}
        hspTeiEndpoint={hspTeiEndpoint}
      />
      <WindowTypeDialog />
    </div>
  )
}
