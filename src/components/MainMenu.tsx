import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onShowDataGrid: (formKey: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onShowDataGrid }) => {
  return (
    <nav className='MainMenuBar'>
      <button onClick={() => onShowDataGrid("datagrid1")}>Show Data Grid 1</button>
      <button onClick={() => onShowDataGrid("datagrid2")}>Show Data Grid 2</button>
    </nav>
  );
};

export default MainMenu;
