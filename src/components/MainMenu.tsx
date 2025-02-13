import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onShowDataGrid: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onShowDataGrid }) => {
  return (
    <nav className='MainMenuBar'>
      <button onClick={onShowDataGrid}>Show DataGrid</button>
      {/* <button>New</button>
      <button>Copy</button>
      <button>Edit</button>
      <button>Delete</button> */}
    </nav>
  );
};

export default MainMenu;
