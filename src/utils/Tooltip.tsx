import React from 'react'

import MuiTooltip from '@material-ui/core/Tooltip'

interface Props {
  title?: string
  disable?: boolean
  children: React.ReactElement
}

export function Tooltip(props: Props) {
  if (props.disable || !props.title) {
    return <>{props.children}</>
  }

  return (
    <MuiTooltip title={props.title} arrow={true}>
      {props.children}
    </MuiTooltip>
  )
}
