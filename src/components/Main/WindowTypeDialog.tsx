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
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useTranslation } from 'src/contexts/i18n'
import { useSelector, useDispatch } from 'react-redux'
import { actions, selectors } from 'src/contexts/state'
import { useMiradorApi } from 'src/contexts/mirador'

export function WindowTypeDialog() {
  const { t } = useTranslation()
  const miradorApi = useMiradorApi()
  const dispatch = useDispatch()
  const open = useSelector(selectors.getWindowTypeDialogOpen)

  function close() {
    dispatch(actions.setWindowTypeDialogOpen({ open: false }))
  }

  function mosaic() {
    miradorApi.mirador.store.dispatch(
      miradorApi.Mirador.actions.updateWorkspace({ type: 'mosaic' })
    )
    close()
  }

  function elastic() {
    miradorApi.mirador.store.dispatch(
      miradorApi.Mirador.actions.updateWorkspace({ type: 'elastic' })
    )
    close()
  }

  function handleKeyPress(
    event: React.KeyboardEvent<HTMLDivElement>,
    type: string
  ) {
    if (
      event.key === 'Enter' ||
      event.key === 'Spacebar' ||
      event.key === ' '
    ) {
      if (type === 'mosaic') mosaic()
      if (type === 'elastic') elastic()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      // see: https://projects.dev.sbb.berlin/issues/14356
      disableScrollLock
    >
      <DialogTitle>{t('windowTypeDialog', 'title')}</DialogTitle>
      <List>
        <ListItem
          button={true}
          onClick={mosaic}
          onKeyPress={(e) => handleKeyPress(e, 'mosaic')}
        >
          {t('windowTypeDialog', 'mosaic') +
            ' - ' +
            t('windowTypeDialog', 'mosaicDescription')}
        </ListItem>
        <ListItem
          button={true}
          onClick={elastic}
          onKeyPress={(e) => handleKeyPress(e, 'elastic')}
        >
          {t('windowTypeDialog', 'elastic') +
            ' - ' +
            t('windowTypeDialog', 'elasticDescription')}
        </ListItem>
      </List>
    </Dialog>
  )
}
