import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'

import './styles.css'
import VirtualList from './containers/virtual-list'
import { data } from './utils/data'

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
      />
    </div>
  )
}

const rootElement = document.getElementById('root')
render(<App/>, rootElement)
