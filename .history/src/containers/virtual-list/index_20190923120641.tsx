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

const initialPosition = {
  top: 0,
  bottom: 0,
  index: 0,
}

function VirtualList(props: VirtualListProps) {
  const { beforeBuffer = 3, afterBuffer = 3, list = [], numberOfContainer = 10 } = props
  console.log('list.length', list.length)
  const [visibleList, setVisibleList] = useState<Item[]>([])
  const visibleItmesPositionRef = useRef<ItemPosition[]>([])
  const lastScrollItemPosition = useRef<ItemPosition>({ top: 0, bottom: 0, index: 0 })
  const lastScrollTopRef = useRef<number>(0)
  const startIndexRef = useRef<number> (0)
  const listBoxRef = useRef<HTMLDivElement | null>(null)
  let listBoxTopRef = useRef<number>(0);
  // 前面缓存元素的最后一个，这是一个要注意点
  const lastBeforeBufferItemPosition = useRef<ItemPosition>(initialPosition);

  // visible list的paddingTop和paddingBottom
  // 在list总长度不变的情况下，要保持visible list的paddingTop +  height + paddingBottom不变，才可以滚动
  const listOffsetRef = useRef({
    startOffset: 0,
    endOffset: 0
  })



  useEffect(function init() {
    window.scrollTo(0, 0);
    listBoxTopRef.current = listBoxRef.current!.getBoundingClientRect().top;
    updateVisibleList(window.pageYOffset)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getScrollTop = () => {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset)
  }

  const handleScroll = () => {
    const scrollTop = getScrollTop();
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
        updateVisibleList(scrollTop)
      }
    }

    if(scrollTop < lastScrollTopRef.current) {
      if(scrollTop < lastScrollItemPosition.current.top) {
        updateStartIndex(scrollTop)
        updateVisibleList(scrollTop)
      }
    }

    lastScrollTopRef.current = scrollTop
  }

  const updateStartIndex = (scrollTop: number) => {
    const targetItemPosition: ItemPosition = visibleItmesPositionRef.current.find(({ bottom }) => bottom > scrollTop)!
    if(!targetItemPosition) return
    lastScrollItemPosition.current = targetItemPosition
    // 滚动的时候，可以确定lastScrollItemPosition，但是对于startIndex，要结合beforeBufferSize判断
    startIndexRef.current = targetItemPosition.index - beforeBuffer >= 0 ? targetItemPosition.index - beforeBuffer : 0
  }

  const updateVisibleList = (scrollTop: number) => {


    const endIndex: number = startIndexRef.current + numberOfContainer + afterBuffer
    let endOffset = 0;
    if(list.length - endIndex - 1 <= 0) {
      endOffset = 0;
    } else {
      // 因为存在缓冲的元素，endIndex会超过list.length - 1
      endOffset = (list.length - endIndex - 1) * 80
    }
    console.log('aaa', lastScrollItemPosition.current, lastBeforeBufferItemPosition.current, startIndexRef.current, endIndex)
    listOffsetRef.current = {
      startOffset: lastScrollItemPosition.current.top - lastBeforeBufferItemPosition.current.top,
      endOffset,
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
    if(index + 1 === beforeBuffer) {
      lastBeforeBufferItemPosition.current = position;
    }
  }

  let top = listOffsetRef.current.startOffset;
  let bottom = listOffsetRef.current.endOffset;
  top = top < 0 ? 0 : top;
  bottom = bottom < 0 ? 0 : bottom;

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
