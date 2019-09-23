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

  console.log('list', list)
  return (
    <div className="App">
      <div className={'hello'}>
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>

      <VirtualList
        list={list}
        numberOfContainer={10}
        minHeight={80}
      >
        {
          (props: any) => {
            const {id, title, content, index, handleCalculatePosition} = props;
            return <ListItem
              key={id}
              title={title}
              content={content}
              index={index}
              id={id}
              onCalculatePosition={handleCalculatePosition}
            />
          }
        }
      </VirtualList>
    </div>
  )
}

const rootElement = document.getElementById('root')
render(<App/>, rootElement)
