import React from 'react';
import './MainMenu.css';


const MainMenu: React.FC = () => {
  return (
    <nav className='MainMenuBar'>
      <button>Action</button>
      <button>New</button>
      <button>Copy</button>
      <button>Edit</button>
      <button>Delete</button>
    </nav>
  );
};

export default MainMenu;
