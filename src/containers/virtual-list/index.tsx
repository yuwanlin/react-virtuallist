import React, { useEffect, useRef, useState } from 'react'

interface VirtualListProps {
  beforeBufferSize?: number
  afterBufferSize?: number
  list: any[]
  numberOfContainer: number
  children: (props: any) => React.ReactNode
  minHeight: number
}

interface ItemPosition {
  top: number
  bottom: number
  index: number
}

export interface ChildrenProps {
  item: any
  index: number,
  handleCalculatePosition: (node: HTMLElement, index: number) => void
}

const initialPosition = {
  top: 0,
  bottom: 0,
  index: 0,
}

function VirtualList(props: VirtualListProps) {
  const { beforeBufferSize = 3, afterBufferSize = 3, list = [], numberOfContainer = 10, children, minHeight } = props
  const [visibleList, setVisibleList] = useState<any[]>([])
  const itmesPositionRef = useRef<ItemPosition[]>([])
  const lastScrollItemPosition = useRef<ItemPosition>({ top: 0, bottom: 0, index: 0 })
  const lastScrollTopRef = useRef<number>(0)
  const startIndexRef = useRef<number> (0)
  const listBoxRef = useRef<HTMLDivElement | null>(null)
  // 前面缓存元素的最后一个，这是一个要注意点
  const lastBeforeBufferItemPosition = useRef<ItemPosition>(initialPosition);

  // visible list的paddingTop和paddingBottom
  // 在list总长度不变的情况下，要保持visible list的paddingTop +  height + paddingBottom不变，才可以滚动
  const listOffsetRef = useRef({
    startOffset: 0,
    endOffset: 0
  })

  useEffect(function init() {
    if(list.length === 0) {
      return;
    }
    // 当有多屏数据，当滚动的非常快的时候，比如滚动到页面底部后有一个updateVisibleList事件，在事件开始执行时list更新了
    // 那么这里也会有一个updateVisibleList，该事件先执行，数据是正确的。然后滚动到页面底部的updateVisibleList事件继续执行，数据是之前的数据。就有问题。
    // 使用setTimeout创建宏任务延迟执行，保证数据正确。
    setTimeout(() => {
      updateVisibleList();
    }, 0);
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
    // 只要list发生变化，就重新渲染。可能长度没变，但是其中某个item内容变了
  }, [list])

  const getScrollTop = () => {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset)
  }

  const handleScroll = () => {
    const scrollTop = getScrollTop();
    // 滚动条向下滚动
    if(scrollTop > lastScrollTopRef.current) {
      if(scrollTop > lastScrollItemPosition.current.bottom) {
        updateStartIndex(scrollTop);
        updateVisibleList();
        lastScrollTopRef.current = scrollTop;
      }
    }

    // 滚动条向上滚动
    if(scrollTop < lastScrollTopRef.current) {
      if(scrollTop < lastScrollItemPosition.current.top) {
        updateStartIndex(scrollTop);
        updateVisibleList();
        lastScrollTopRef.current = scrollTop;
      }
    }
  }

  const updateStartIndex = (scrollTop: number) => {
    const targetItemPosition: ItemPosition = itmesPositionRef.current.find(({ bottom }) => bottom > scrollTop)!
    if(!targetItemPosition) return
    lastScrollItemPosition.current = targetItemPosition;
    // 滚动的时候，可以确定lastScrollItemPosition，但是对于startIndex，要结合beforeBufferSize判断
    startIndexRef.current = targetItemPosition.index - beforeBufferSize >= 0 ? targetItemPosition.index - beforeBufferSize : 0;
  }

  const updateVisibleList = () => {
    let endIndex: number = startIndexRef.current + numberOfContainer + afterBufferSize;
    if(startIndexRef.current >= beforeBufferSize) {
      endIndex = endIndex + beforeBufferSize;
    }
    if(endIndex >= list.length) {
      endIndex = list.length;
    }

    let startOffset = 0, endOffset = 0;
    endOffset = (list.length - endIndex) * minHeight;

    // 滚动后更前列表前，最后一个元素的高度
    const position = itmesPositionRef.current.find(p => p.index === startIndexRef.current);
    if(position && itmesPositionRef.current[0]) {
      // itemspositionref.current可能将某一个元素添加了多次
      // 1. 只添加一次
      // 2. 遍历，找到index相等的，而不是找到index对应的元素
      startOffset = position.top - itmesPositionRef.current[0].top;
    }
    listOffsetRef.current = {
      startOffset,
      endOffset,
    }
    console.log('index是否相等：', position, startIndexRef.current, endIndex, list.length, itmesPositionRef.current.length)
    setVisibleList(list.slice(startIndexRef.current, endIndex));
  }

  const handleCalculatePosition = (node: HTMLElement, index: number) => {
    if(!node) return;
    const cachedPosition = itmesPositionRef.current!.find(position => position.index === index);
    if(cachedPosition) return;
    const { top, height } = node.getBoundingClientRect();
    const nodeOffsetY = top + getScrollTop();
    const position = {
      top: nodeOffsetY,
      bottom: nodeOffsetY + height,
      index
    }
    itmesPositionRef.current.push(position);
    if(index + 1 === beforeBufferSize) {
      lastBeforeBufferItemPosition.current = position;
    }
  }

  let top = listOffsetRef.current.startOffset;
  let bottom = 0; listOffsetRef.current.endOffset;
  top = top < 0 ? 0 : top;
  bottom = bottom < 0 ? 0 : bottom;


  if(list.length === 0) {
    return null;
  }

  return (
    <div
      style={{paddingTop: top + 'px', paddingBottom : listOffsetRef.current.endOffset + 'px'}}
      ref={listBoxRef}
    >
      {
        visibleList.map((item: any, index: number) => {
          return children!({
            item,
            index: startIndexRef.current + index,
            handleCalculatePosition
          })
        })
      }
    </div>
  )
}

export default VirtualList
