import { useState } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import Dialog from './components/Dialog';
import { forms } from "./data_modules/data";

function App() {
  const [dialogs, setDialogs] = useState([]);
  const [zIndexMap, setZIndexMap] = useState({});

  const showDialog = (key) => {
    const newDialogIndex = dialogs.length;
    setDialogs([...dialogs, { key }]);
    setZIndexMap({ ...zIndexMap, [newDialogIndex]: newDialogIndex + 1 });
    console.log("Show dialog", forms[key], dialogs);
  };

  const closeDialog = (index) => {
    setDialogs(dialogs.filter((_, i) => i !== index));
    const newZIndexMap = { ...zIndexMap };
    delete newZIndexMap[index];
    setZIndexMap(newZIndexMap);
  };

  return (
    <>
      <MainMenu showDialog={showDialog} />
      <div className='WorkSpace'>
        {dialogs.map((dialog, index) => (
          <Dialog
            key={index}
            onClose={() => closeDialog(index)}
            currentFormKey={dialog.key}
            isTopDialog={index === dialogs.length - 1}
            zIndex={zIndexMap[index] || 0}
          />
        ))}
      </div>

    </>
  );
}

export default App;
