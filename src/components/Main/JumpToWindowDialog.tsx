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

interface OpenObjects {
  id: string
  title: string
}

export function JumpToWindowDialog() {
  const { t } = useTranslation()
  const miradorApi = useMiradorApi()
  const dispatch = useDispatch()
  const open = useSelector(selectors.getJumpToWindowDialogOpen)
  const [openObjects, setOpenObjects] = useState<OpenObjects[]>([])
  const cls = useStyles()

  function close() {
    dispatch(actions.setJumpToWindowDialogOpen({ open: false }))
  }
  function handleClick(windowId: string) {
    miradorApi.mirador.store.dispatch(
      miradorApi.Mirador.actions.focusWindow(windowId, true),
    )
    const isWorkspaceAddVisible = miradorApi.Mirador.selectors.getWorkspace(
      miradorApi.mirador.store.getState(),
    ).isWorkspaceAddVisible
    if (isWorkspaceAddVisible) {
      miradorApi.mirador.store.dispatch(
        miradorApi.Mirador.actions.setWorkspaceAddVisibility(false),
      )
    }
    close()
  }

  useEffect(() => {
    if (miradorApi.mirador && miradorApi.Mirador) {
      const state = miradorApi.mirador.store.getState()
      const openWindows = miradorApi.Mirador.selectors.getWindowTitles(state)

      for (const [key, value] of Object.entries(openWindows)) {
        if (value === undefined) {
          const elem = document.getElementById(key)
          if (elem) {
            const title = elem.querySelectorAll('#topBarTitle')[0]
            if (title) {
              openWindows[key] = title.innerHTML
            } else {
              openWindows[key] = key
            }
          }
        }
      }
      setOpenObjects(openWindows)
    }
  }, [open])

  const isFocused = (id: string): boolean => {
    const state = miradorApi.mirador.store.getState()
    return miradorApi.Mirador.selectors.isFocused(state, {
      windowId: id,
    })
  }

  return (
    <Dialog open={open} onClose={close} disableScrollLock>
      <DialogTitle>{t('jumpToWindowDialog', 'title')}</DialogTitle>
      <List className={cls.list}>
        {Object.entries(openObjects).map(([id, title]) => (
          <ListItem
            button={true}
            key={id}
            onClick={() => handleClick(id)}
            selected={isFocused(id)}
          >
            {title}
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}
