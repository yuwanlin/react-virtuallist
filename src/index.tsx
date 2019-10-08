import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'

import './styles.css'
import VirtualList from './containers/virtual-list'
import { data } from './utils/data'
import ListItem from './component/list-item/index';

function App() {
  const [list, setList] = useState([]);
  useEffect(() => {
    setList(data.list);
  }, [])

  return (
    <div className="App">
      <div className={'hello'}>
        <h2>Start editing to see some magic happen!</h2>
      </div>
    {
      list.length > 0 && (
        <VirtualList
          list={list}
          numberOfContainer={10}
          minHeight={150}
        >
          {
            (props: any) => {
              const {item, index, handleCalculatePosition, handleUnmount} = props;
              const { id, title, content } = item;
              return <ListItem
                key={id}
                title={title}
                content={content}
                index={index}
                id={id}
                onCalculatePosition={handleCalculatePosition}
                onUnmount={handleUnmount}
              />
            }
          }
        </VirtualList>
      )
    }
    </div>
  )
}

const rootElement = document.getElementById('root')
render(<App/>, rootElement)
