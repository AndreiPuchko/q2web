import { useState } from 'react';
import './App.css';

import WorkSpace from './components/WorkSpace';
import MainMenu from './components/MainMenu';

function App() {
  const [dialogs, setDialogs] = useState([]);

  const handleShowDataGrid = (key) => {
    setDialogs([...dialogs, { key }]);
  };

  const handleCloseDialog = (index) => {
    setDialogs(dialogs.filter((_, i) => i !== index));
  };

  return (
    <>
      <MainMenu onShowDataGrid={handleShowDataGrid} />
      <WorkSpace dialogs={dialogs} onCloseDialog={handleCloseDialog} />
    </>
  );
}

export default App;
