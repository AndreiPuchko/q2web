import { useState } from 'react'
import './App.css'

import GridData from "./data_modules/data"
import { columns } from "./data_modules/data"

import DridComponent from './components/DataGrid'
import Dialog from './components/Dialog'

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
      <Dialog>
        <DridComponent columns={columns} data={GridData} />
      </Dialog>
    </>
  )
}

export default App
