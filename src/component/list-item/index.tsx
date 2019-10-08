import React, { useState, useRef, useEffect } from 'react'
import './style.css'

interface ListItemProps {
  title: string
  content: string
  onCalculatePosition: (node: HTMLElement, index: number, isDomtreeChanged?: boolean) => void
  onUnmount: (node: HTMLElement) => void
  index: number
  id: number
}
function ListItem(props: ListItemProps) {
  const { onCalculatePosition, title, content, id, index, onUnmount } = props;
  const [ boxInnerData, setBoxInnerData ] = useState<number[]>([]);
  const itemRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if(!itemRef.current) return;
    itemRef.current && onCalculatePosition(itemRef.current!, index);

    return () => {
      itemRef.current && onUnmount(itemRef.current!)
    }
  }, [])

  const handleClick  = () => {
    const newList: number[] = [ ...boxInnerData ];
    newList.push(newList.length);
    setBoxInnerData(newList);
  }

  return (
    <div className={'list-item'} ref={itemRef}>
      <h2 className={'title'}>{id}.{title}</h2>
      <h3 className={'content'}>{content}</h3>
      <div className='box'>
        <div className='add-btn' onClick={handleClick}>click me</div>
        {
          boxInnerData.map(data => <p key={data} className='text'>{data}</p>)
        }
      </div>
    </div>
  )
}

export default ListItem
