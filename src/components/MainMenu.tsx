import React from 'react';
import './MainMenu.css';
import { forms } from '../data_modules/data';

interface MainMenuProps {
  onShowDataGrid: (formKey: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onShowDataGrid }) => {
  const menuStructure = Object.keys(forms).reduce((acc, key) => {
    const [mainMenu, subMenu] = forms[key].menubarpath.split('|');
    if (!acc[mainMenu]) {
      acc[mainMenu] = [];
    }
    acc[mainMenu].push({ key, label: subMenu });
    return acc;
  }, {} as Record<string, { key: string, label: string }[]>);

  const openNewTab = () => {
    window.open('/empty-app-page', '_blank');
  };

  return (
    <nav className='MainMenuBar'>
      <div className='menuItems'>
        {Object.keys(menuStructure).map((mainMenu) => (
          <div className='dropdown' key={mainMenu}>
            <button className='dropbtn'>{mainMenu}</button>
            <div className='dropdown-content'>
              {menuStructure[mainMenu].map((item) => (
                <button key={item.key} onClick={() => onShowDataGrid(item.key)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className='newTabButton' onClick={openNewTab}><b>+</b></button>
    </nav>
  );
};

export default MainMenu;
