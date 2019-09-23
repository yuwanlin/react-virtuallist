import React, { useEffect, useRef, useLayoutEffect } from 'react'
import './style.css'

interface ListItemProps {
  title: string
  content: string
  onCalculatePosition: (node: HTMLElement, index: number) => void
  index: number
  id: number
}
function ListItem(props: ListItemProps) {
  const { onCalculatePosition, title, content, id, index } = props;
  const itemRef = useRef(null);
  useLayoutEffect(() => {
    itemRef.current && onCalculatePosition(itemRef.current!, index);
  }, [])
  return (
    <div className={'list-item'} ref={itemRef}>
      <h2 className={'title'}>{id}.{title}</h2>
      <h3 className={'content'}>{content}</h3>
    </div>
  )
}

export default ListItem
