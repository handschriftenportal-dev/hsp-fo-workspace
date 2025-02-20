import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import { makeStyles } from '@material-ui/core/styles'

import { useTranslation } from 'src/contexts/i18n'
import { useMiradorApi } from 'src/contexts/mirador'
import { actions, selectors } from 'src/contexts/state'

const useStyles = makeStyles((theme) => ({
  list: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}))

export function WindowTypeDialog() {
  const { t } = useTranslation()
  const miradorApi = useMiradorApi()
  const dispatch = useDispatch()
  const open = useSelector(selectors.getWindowTypeDialogOpen)
  const cls = useStyles()
  const [workspaceType, setWorkspaceType] = useState('mosaic')

  useEffect(() => {
    if (miradorApi.mirador && miradorApi.Mirador) {
      const state = miradorApi.mirador.store.getState()
      setWorkspaceType(miradorApi.Mirador.selectors.getWorkspaceType(state))
    }
  }, [open])

  function close() {
    dispatch(actions.setWindowTypeDialogOpen({ open: false }))
  }

  function mosaic() {
    miradorApi.mirador.store.dispatch(
      miradorApi.Mirador.actions.updateWorkspace({ type: 'mosaic' }),
    )
    close()
  }

  function elastic() {
    miradorApi.mirador.store.dispatch(
      miradorApi.Mirador.actions.updateWorkspace({ type: 'elastic' }),
    )
    close()
  }

  return (
    <Dialog open={open} onClose={close} disableScrollLock>
      <DialogTitle>{t('windowTypeDialog', 'title')}</DialogTitle>
      <List className={cls.list}>
        <ListItem
          button={true}
          onClick={mosaic}
          selected={workspaceType === 'mosaic'}
        >
          {t('windowTypeDialog', 'mosaic') +
            ' - ' +
            t('windowTypeDialog', 'mosaicDescription')}
        </ListItem>
        <ListItem
          button={true}
          onClick={elastic}
          selected={workspaceType === 'elastic'}
        >
          {t('windowTypeDialog', 'elastic') +
            ' - ' +
            t('windowTypeDialog', 'elasticDescription')}
        </ListItem>
      </List>
    </Dialog>
  )
}
