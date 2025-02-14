import { useState } from 'react';
import './App.css';

import WorkSpace from './components/WorkSpace';
import MainMenu from './components/MainMenu';

function App() {
  const [dialogs, setDialogs] = useState([]);
  const [zIndexMap, setZIndexMap] = useState({});

  const showDialog = (key) => {
    const newDialogIndex = dialogs.length;
    setDialogs([...dialogs, { key }]);
    setZIndexMap({ ...zIndexMap, [newDialogIndex]: newDialogIndex + 1 });
  };

  const closeDialog = (index) => {
    setDialogs(dialogs.filter((_, i) => i !== index));
    const newZIndexMap = { ...zIndexMap };
    delete newZIndexMap[index];
    setZIndexMap(newZIndexMap);
  };

  const showForm = (formKey, rowData) => {
    const newDialogIndex = dialogs.length;
    setDialogs([...dialogs, { key: formKey, rowData }]);
    setZIndexMap({ ...zIndexMap, [newDialogIndex]: newDialogIndex + 1 });
  };

  return (
    <>
      <MainMenu onShowDataGrid={showDialog} />
      <WorkSpace dialogs={dialogs} onCloseDialog={closeDialog} zIndexMap={zIndexMap} onShowForm={showForm} />
    </>
  );
}

export default App;
