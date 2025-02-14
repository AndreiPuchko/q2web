import { useState } from 'react';
import './App.css';

import WorkSpace from './components/WorkSpace';
import MainMenu from './components/MainMenu';

function App() {
  const [dialogs, setDialogs] = useState([]);

  const showDialog = (key) => {
    setDialogs([...dialogs, { key }]);
  };

  const closeDialog = (index) => {
    console.log(index);
    setDialogs(dialogs.filter((_, i) => i !== index));
  };

  return (
    <>
      <MainMenu onShowDataGrid={showDialog} />
      <WorkSpace dialogs={dialogs} onCloseDialog={closeDialog} />
    </>
  );
}

export default App;
