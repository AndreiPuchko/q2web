import React from 'react';
import './MainMenu.css';
import { forms } from '../data_modules/data';

interface MainMenuProps {
  onShowDataGrid: (formKey: string) => void;
}

const buildMenuStructure = (forms: Record<string, any>) => {
  const structure = {};
  Object.keys(forms).forEach((key) => {
    const path = forms[key].menubarpath.split('|');
    let currentLevel = structure;
    path.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = index === path.length - 1 ? { key, label: part } : {};
      }
      currentLevel = currentLevel[part];
    });
  });
  return structure;
};

const renderMenu = (menuStructure: any, onShowDataGrid: (formKey: string) => void) => {
  return Object.keys(menuStructure).map((menu) => {
    const item = menuStructure[menu];
    if (item.key) {
      return (
        <button key={item.key} onClick={() => onShowDataGrid(item.key)}>
          {item.label}
        </button>
      );
    }
    return (
      <div className='submenu' key={menu}>
        <button className='submenubtn'>{menu}</button>
        <div className='submenu-content'>
          {renderMenu(item, onShowDataGrid)}
        </div>
      </div>
    );
  });
};

const MainMenu: React.FC<MainMenuProps> = ({ onShowDataGrid }) => {
  const menuStructure = buildMenuStructure(forms);

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
              {renderMenu(menuStructure[mainMenu], onShowDataGrid)}
            </div>
          </div>
        ))}
      </div>
      <button className='newTabButton' onClick={openNewTab}><b>+</b></button>
    </nav>
  );
};

export default MainMenu;
