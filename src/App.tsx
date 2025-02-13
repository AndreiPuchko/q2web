import { useState } from 'react'
import './App.css'

import GridData from "./data_modules/data"
import { columns } from "./data_modules/data"

import DridComponent from './components/DataGridComponent'
import DialogContainer from './components/DialogContainer'

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <nav className='ToolBar'>
        <button>Action</button>
        <button>New</button>
        <button>Copy</button>
        <button>Edit</button>
        <button>Delete</button>
      </nav>
      <DialogContainer>
        <DridComponent columns={columns} data={GridData} />
      </DialogContainer>
    </>
  )
}

export default App
