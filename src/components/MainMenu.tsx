import React, { useState } from 'react';
import './MainMenu.css';
import { forms, Q2Form } from '../data_modules/data';

interface MainMenuProps {
  showDialog: (metaData: any) => void;
}

const buildMenuStructure = (forms: Q2Form[]) => {
  const structure = {};
  forms.forEach((form) => {
    if (!form.menubarpath) return; // Ignore forms without menubarpath
    const path = form.menubarpath.split('|');
    let currentLevel = structure;
    path.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = index === path.length - 1 ? { key: form.key, label: part, menutoolbar: form.menutoolbar } : {};
      }
      currentLevel = currentLevel[part];
    });
  });
  return structure;
};

const renderMenu = (menuStructure: any, showDialog: (metaData: any) => void, hideDropdown: () => void) => {
  return Object.keys(menuStructure).map((menu) => {
    const item = menuStructure[menu];
    if (item.key) {
      return (
        <button key={item.key} onClick={() => { showDialog(forms.find(form => form.key === item.key)); hideDropdown(); }}>
          {item.label}
        </button>
      );
    }
    return (
      <div className='submenu' key={menu}>
        <button className='submenubtn'>{menu}</button>
        <div className='submenu-content'>
          {renderMenu(item, showDialog, hideDropdown)}
        </div>
      </div>
    );
  });
};

const renderToolButtons = (forms: Q2Form[], showDialog: (metaData: any) => void, hideDropdown: () => void) => {
  return forms.map((form) => {
    const menutoolbar = form.menutoolbar;
    if (menutoolbar === 1 || menutoolbar === true || menutoolbar === "true") {
      const pathParts = form.menubarpath.split('|');
      const label = pathParts[pathParts.length - 1];
      return (
        <button key={form.key} onClick={() => { showDialog(form); hideDropdown(); }} className='toolButton'>
          {label}
        </button>
      );
    }
    return null;
  });
};

const MainMenu: React.FC<MainMenuProps> = ({ showDialog }) => {
  const [visibleDropdown, setVisibleDropdown] = useState<string | null>(null);
  const menuStructure = buildMenuStructure(forms);

  const openNewTab = () => {
    window.open('/empty-app-page', '_blank');
  };

  const hideDropdown = () => {
    setVisibleDropdown(null);
  };

  return (
    <nav className='MainMenuBar'>
      <div className='menuItems' onMouseLeave={hideDropdown}>
        {Object.keys(menuStructure).map((mainMenu) => (
          <div className='dropdown' key={mainMenu} onMouseEnter={() => setVisibleDropdown(mainMenu)}>
            <button className='dropbtn'>{mainMenu}</button>
            <div className='dropdown-content' style={{ display: visibleDropdown === mainMenu ? 'block' : 'none' }}>
              {renderMenu(menuStructure[mainMenu], showDialog, hideDropdown)}
            </div>
          </div>
        ))}
      </div>
      <div className='spacer1'></div>
      <div className='toolButtons'>
        {renderToolButtons(forms, showDialog, hideDropdown)}
      </div>
      <div className='spacer9'></div>
      <button className='newTabButton' onClick={openNewTab}><b>+</b></button>
    </nav>
  );
};

export default MainMenu;
