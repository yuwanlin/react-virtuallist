## 简介
适用于window上滚动的，列表长度不定，列表项高度不定的虚拟列表。

## demo
```
1. git clone git@github.com:yuwanlin/react-virtuallist.git
2. cd react-virtuallist
3. npm install / yarn
4. npm start
```

## 用法
```
{
  filterContent.length > 0 && (
    <VirtualList
      list={filterContent}
      numberOfContainer={8}
      beforeBufferSize={2}
      afterBufferSize={2}
      minHeight={200}
    >
      {
        (props: ChildrenProps) => {
          const { handleCalculatePosition, index, item, handleUnmount } = props;
          const { uid } = item as SingleMessage;
          return (
            <RecordItem
              key={ uid }
              record={ item }
              onCalculatePosition={handleCalculatePosition}
              onUnmount={handleUnmount}
              index={index}
          />
          )
        }
      }
    </VirtualList>
  )
}
```

## options

**list**
必选。需要渲染的数据

**numberOfContainer**
必选。应当渲染几个列表元素，这些元素应该充满屏幕

**beforeBufferSize**
可选。在numberOfContainer个元素的前面渲染的元素，防止向上滚动时出现空白，默认值是3

**afterBufferSize**
可选。在numberOfContainer个元素的后面渲染的元素，防止向下滚动时出现空白，默认值是3

**minHeight**
元素的最小高度，对于非定高的元素，这用于确定padding-bottom。对于等高元素，就是元素的高度

## children props
**item**
列表项本身

## index
列表项处于所有数据列表中的位置

## handleCalculatePosition
该函数用于缓存列表项的位置信息

## ListItem组件
```javascript
itemRef = createRef<HTMLDivElement>();

componentDidMount() {
  const { onCalculatePosition, index } = this.props;
  this.itemRef.current && onCalculatePosition(this.itemRef.current, index);
}

componentWillUnmount() {
  const { onUnmount } = this.props;
  onUnmount && onUnmount(this.itemRef.current!)
}

render() {
  return <div ref={this.itemRef}> {/* something other */} </div>
}
```
useHooks
```javascript
const { onCalculatePosition, index, onUnmount } = props;
itemRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
  if(!itemRef.current) return;
  onCalculatePosition && onCalculatePosition(itemRef.current!, index);
  return () => {
    onUnmount && onUnmount(this.itemRef.current!)
  }
}, [])

return (
  <div ref={this.itemRef}> {/* something other */} </div>
)
```
