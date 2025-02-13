import { useState } from 'react'
import './App.css'

import GridData from "./data_modules/data"
import { columns } from "./data_modules/data"

import DridComponent from './components/DataGrid'
import Dialog from './components/Dialog'
import MainMenu from './components/MainMenu'

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MainMenu />
      <Dialog>
        <DridComponent columns={columns} data={GridData} />
      </Dialog>
    </>
  )
}

export default App
