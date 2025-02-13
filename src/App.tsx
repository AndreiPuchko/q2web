import { useState } from 'react';
import './App.css';

import DridComponent from './components/DataGrid';
import Dialog from './components/Dialog';
import MainMenu from './components/MainMenu';

function App() {
  const [showDialog, setShowDialog] = useState(false);
  const currentFormKey = "datagrid1";

  return (
    <>
      <MainMenu onShowDataGrid={() => setShowDialog(true)} />
      {showDialog && (
        <Dialog onClose={() => setShowDialog(false)}>
          <DridComponent currentFormKey={currentFormKey} />
        </Dialog>
      )}
    </>
  );
}

export default App;
