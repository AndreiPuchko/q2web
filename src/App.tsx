import { useState } from 'react';
import './App.css';

import GridData from "./data_modules/data";
import { columns } from "./data_modules/data";
import { forms } from "./data_modules/data";

import DridComponent from './components/DataGrid';
import Dialog from './components/Dialog';
import MainMenu from './components/MainMenu';

function App() {
  const [showDialog, setShowDialog] = useState(false);
  // console.log(forms["datagrid1"]);
  console.log(Object.keys(forms));
  return (
    <>
      <MainMenu onShowDataGrid={() => setShowDialog(true)} />
      {showDialog && (
        <Dialog onClose={() => setShowDialog(false)}>
          <DridComponent columns={columns} data={GridData} />
        </Dialog>
      )}
    </>
  );
}

export default App;
