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
  const listBoxRef = useRef<HTMLDivElement | null>(null)
  let listBoxTopRef = useRef<number>(0);
  // visible list的paddingTop和paddingBottom
  // 在list总长度不变的情况下，要保持visible list的paddingTop +  height + paddingBottom不变，才可以滚动
  const listOffsetRef = useRef({
    startOffset: 0,
    endOffset: 0
  })



  useEffect(() => {
    listBoxTopRef.current = listBoxRef.current!.getBoundingClientRect().top;
    updateListBoxHeight()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getScrollTop = () => {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset)
  }

  const handleScroll = () => {
    const scrollTop = getScrollTop()
    // 滚动条向下滚动
    if(scrollTop > lastScrollTopRef.current) {
      if(scrollTop > lastScrollItemPosition.current.bottom) {
        // const firstItemRect = listBoxRef.current!.children[0].getBoundingClientRect();
        // const { top, height } = firstItemRect;
        // console.log("TCL: handleScroll -> firstItemTop", top + height)
        // if(scrollTop < top + height) {
        //   return;
        // }
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
    if(!targetItemPosition) return
    lastScrollItemPosition.current = targetItemPosition
    startIndexRef.current = targetItemPosition.index
  }

  const updateListBoxHeight = () => {
    const endIndex: number = startIndexRef.current + numberOfContainer + beforeBuffer + afterBuffer

    console.log('aaa', lastScrollItemPosition.current.top, listBoxTopRef.current)
    listOffsetRef.current = {
      startOffset: lastScrollItemPosition.current.top - listBoxTopRef.current,
      endOffset: (list.length - endIndex - 1) * 100
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

  let top = listOffsetRef.current.startOffset;
  top = top < 0 ? 0 : top
  const bottom = listOffsetRef.current.endOffset;

  return (
    <div className={'virtual-list-box' + bottom}
      style={{paddingTop: top + 'px', paddingBottom : listOffsetRef.current.endOffset + 'px'}}
      ref={listBoxRef}
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
