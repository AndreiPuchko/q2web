import React from 'react';
import './MainMenu.css';
import { forms } from '../data_modules/data';

interface MainMenuProps {
  showDialog: (metaData: any) => void;
}

const buildMenuStructure = (forms: Record<string, any>) => {
  const structure = {};
  Object.keys(forms).forEach((key) => {
    const path = forms[key].menubarpath.split('|');
    let currentLevel = structure;
    path.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = index === path.length - 1 ? { key, label: part, menutoolbar: forms[key].menutoolbar } : {};
      }
      currentLevel = currentLevel[part];
    });
  });
  return structure;
};

const renderMenu = (menuStructure: any, showDialog: (metaData: any) => void) => {
  return Object.keys(menuStructure).map((menu) => {
    const item = menuStructure[menu];
    if (item.key) {
      return (
        <button key={item.key} onClick={() => showDialog(forms[item.key])}>
          {item.label}
        </button>
      );
    }
    return (
      <div className='submenu' key={menu}>
        <button className='submenubtn'>{menu}</button>
        <div className='submenu-content'>
          {renderMenu(item, showDialog)}
        </div>
      </div>
    );
  });
};

const renderToolButtons = (forms: Record<string, any>, showDialog: (metaData: any) => void) => {
  return Object.keys(forms).map((key) => {
    const menutoolbar = forms[key].menutoolbar;
    if (menutoolbar === 1 || menutoolbar === true || menutoolbar === "true") {
      const pathParts = forms[key].menubarpath.split('|');
      const label = pathParts[pathParts.length - 1];
      return (
        <button key={key} onClick={() => showDialog(forms[key])} className='toolButton'>
          {label}
        </button>
      );
    }
    return null;
  });
};

const MainMenu: React.FC<MainMenuProps> = ({ showDialog }) => {
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
              {renderMenu(menuStructure[mainMenu], showDialog)}
            </div>
          </div>
        ))}
      </div>
      <div className='spacer1'></div>
      <div className='toolButtons'>
        {renderToolButtons(forms, showDialog)}
      </div>
      <div className='spacer9'></div>
      <button className='newTabButton' onClick={openNewTab}><b>+</b></button>
    </nav>
  );
};

export default MainMenu;
