import { useState } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import Dialog from './components/Dialog';

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
      <div className='WorkSpace'>
        {dialogs.map((dialog, index) => (
          <Dialog
            key={index}
            onClose={() => closeDialog(index)}
            currentFormKey={dialog.key}
            isTopDialog={index === dialogs.length - 1}
            zIndex={zIndexMap[index] || 0}
            onShowForm={showForm}
          />
        ))}
      </div>

    </>
  );
}

export default App;
