import { useState } from 'react';
import './App.css';

import WorkSpace from './components/WorkSpace';
import MainMenu from './components/MainMenu';

function App() {
  return (
    <>
      <WorkSpace>
        {(showDialog) => <MainMenu onShowDataGrid={showDialog} />}
      </WorkSpace>
    </>
  );
}

export default App;
