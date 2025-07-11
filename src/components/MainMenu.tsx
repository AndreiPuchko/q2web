import React, { useState } from 'react';
import './MainMenu.css';
import { Q2Form } from "../q2_modules/Q2Form";
//import { forms } from '../data_modules/data';
import { q2forms } from '../q2app/q2app'

interface MainMenuProps {
  showDialog: (metaData: any) => void;
}


function buildMenuStructure(forms: Q2Form[]): any {
  const structure: any = {};

  let uid: number = 0;
  forms.forEach((form, index) => {
    if (!form.menubarpath) return;
    const path = form.menubarpath.split('|');
    let currentLevel = structure;

    path.forEach((part, i) => {
      if (!currentLevel[part]) {
        uid++;

        currentLevel[part] = {
          __meta__: {
            label: part,
            seq: uid,
            key: i === path.length - 1 ? form.key : null,
            menutoolbar: i === path.length - 1 ? form.menutoolbar : null
          },
        };
      }
      currentLevel = currentLevel[part];
    });
  });
  // console.log(structure)
  return structure;
}


const renderMenu = (menuStructure: any, showDialog: (metaData: any) => void, hideDropdown: () => void) => {
  const items = Object.entries(menuStructure)
    .filter(itm => itm[0] !== "__meta__")
    .map(([key, value]: [string, any]) => ({ key, ...value.__meta__, children: value }))
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));

  return items.map(item => {
    if (item.key && item.label === '-') {
      return <hr key={item.key} />;
    }

    if (item.label !== "" && item.key && item.key !== null) {
      return (
        <button key={item.key} onClick={() => {
          showDialog(q2forms.find(form => form.key === item.key));
          hideDropdown();
        }}>
          {item.label}
        </button>
      );
    }

    // It's a submenu
    return (
      <div className='submenu' key={item.label}>
        <button className='submenubtn'>{item.label}</button>
        <div className='submenu-content'>
          {renderMenu(item.children, showDialog, hideDropdown)}
        </div>
      </div>
    );
  });
};


const renderToolButtons = (forms: Q2Form[], showDialog: (metaData: any) => void, hideDropdown: () => void) => {
  return forms.map((form) => {
    const menutoolbar = form.menutoolbar;
    if (menutoolbar === 1 || menutoolbar === true) {
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
  const menuStructure = buildMenuStructure(q2forms);

  const items = Object.entries(menuStructure)
    .map(([key, value]: [string, any]) => ({ key, ...value.__meta__, children: value }))
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));

  const openNewTab = () => {
    window.open('/', '_blank');
  };

  const hideDropdown = () => {
    setVisibleDropdown(null);
  };

  return (
    <nav className='MainMenuBar'>
      <div className='menuItems' onMouseLeave={hideDropdown}>
        {items.map((item) => (
          <div className='dropdown' key={item.seq} onMouseEnter={() => setVisibleDropdown(item.label)}>
            <button className='dropbtn'>{item.label}</button>
            <div
              className='dropdown-content'
              style={{ display: visibleDropdown === item.label ? 'block' : 'none' }}
            >
              {renderMenu(item.children, showDialog, hideDropdown)}
            </div>
          </div>
        ))}
      </div>
      <div className='spacer1'></div>
      <div className='toolButtons'>
        {renderToolButtons(q2forms, showDialog, hideDropdown)}
      </div>
      <div className='spacer9'></div>
      <button className='newTabButton' onClick={openNewTab}><b>+</b></button>
    </nav>
  );
};

export default MainMenu;
