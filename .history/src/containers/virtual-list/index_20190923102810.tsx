import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { Item } from '../../utils/data'
import './style.css'
import ListItem from '../../component/list-item'

interface VirtualListProps {
  beforeBuffer?: number
  afterBuffer?: number
  list: Item[]
  numberOfContainer: number
}

interface ItemPosition {
  top: number
  bottom: number
  index: number
}

function VirtualList(props: VirtualListProps) {
  const { beforeBuffer = 2, afterBuffer = 2, list = [], numberOfContainer = 10 } = props
  const [visibleList, setVisibleList] = useState<Item[]>([])
  const visibleItmesPositionRef = useRef<ItemPosition[]>([])
  const lastScrollItemPosition = useRef<ItemPosition>({ top: 0, bottom: 0, index: 0 })
  const lastScrollTopRef = useRef<number>(0)
  const startIndexRef = useRef<number> (0)
  // visible list的paddingTop和paddingBottom
  // 在list总长度不变的情况下，要保持visible list的paddingTop +  height + paddingBottom不变，才可以滚动
  const listOffsetRef = useRef({
    startOffset: 0,
    endOffset: 0
  })



  useEffect(() => {
    console.log('parent useEffect')
    updateListBoxHeight()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useLayoutEffect(() => {
    console.log('parent useLayoutEffect')
  }, [])

  const getScrollTop = () => {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset)
  }

  const handleScroll = () => {
    const scrollTop = getScrollTop()
    console.log('scrollTop', scrollTop, lastScrollItemPosition.current.bottom)
    // 滚动条向下滚动
    if(scrollTop > lastScrollTopRef.current) {
      if(scrollTop > lastScrollItemPosition.current.bottom) {
        updateStartIndex(scrollTop)
        updateListBoxHeight()
      }
    }

    if(scrollTop < lastScrollTopRef.current) {
      if(scrollTop < lastScrollItemPosition.current.top) {
        updateStartIndex(scrollTop)
        updateListBoxHeight()
      }
    }

    lastScrollTopRef.current = scrollTop
  }

  const updateStartIndex = (scrollTop: number) => {
    const targetItemPosition: ItemPosition = visibleItmesPositionRef.current.find(({ bottom }) => bottom > scrollTop)!
    console.log('targetItemPosition', targetItemPosition)
    if(!targetItemPosition) return
    lastScrollItemPosition.current = targetItemPosition
    startIndexRef.current = targetItemPosition.index
  }

  const updateListBoxHeight = () => {
    const endIndex: number = startIndexRef.current + numberOfContainer + beforeBuffer + afterBuffer
    listOffsetRef.current = {
      startOffset: startIndexRef.current * 100,
      endOffset: (list.length - endIndex) * 100
    }
    setVisibleList(list.slice(startIndexRef.current, endIndex))
  }

  const handleCalculatePosition = (node: HTMLElement, index: number) => {
    if(!node) return
    const { top, height } = node.getBoundingClientRect()
    const nodeOffsetY = top + getScrollTop()
    const position = {
      top: nodeOffsetY,
      bottom: nodeOffsetY + height,
      index
    }
    visibleItmesPositionRef.current.push(position)
  }

  console.log('parent render', listOffsetRef.current.startOffset)
  const top = listOffsetRef.current.startOffset;
  const bottom = listOffsetRef.current.endOffset;

  return (
    <div className={'virtual-list-box' + bottom}
      style={{paddingTop: top + 'px', paddingBottom : listOffsetRef.current.endOffset + 'px'}}
    >
      {
        visibleList.map((item: Item, index: number) => {
          const { id, title, content } = item
          return (
            <ListItem
              key={id}
              title={title}
              content={content}
              index={startIndexRef.current + index}
              id={id}
              onCalculatePosition={handleCalculatePosition}
            />
          )
        })
      }
    </div>
  )
}

export default VirtualList