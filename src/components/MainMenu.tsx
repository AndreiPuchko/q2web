import React from 'react';
import { Q2Form } from "../q2_modules/Q2Form";
import { showDialog } from '../q2_modules/Q2Api';
import { GetQ2AppInstance } from "../q2_modules/Q2Api"
import { House, ArrowBigLeft, Moon, Sun, LogIn, LogOut } from "lucide-react";

import './MainMenu.css';

interface MainMenuProps {
    q2forms: Array<Q2Form>;
    isLoggedIn: boolean;
}

interface MainMenuState {
    visibleDropdown: string | null;
    activated: boolean;
}

export class MainMenu extends React.Component<MainMenuProps, MainMenuState> {
    menuRef: React.RefObject<HTMLDivElement | null>;

    constructor(props: MainMenuProps) {
        super(props);
        this.state = {
            visibleDropdown: null,
            activated: false,
        };
        this.menuRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.menuRef.current && !this.menuRef.current.contains(event.target as Node)) {
            this.setState({ visibleDropdown: null, activated: false });
        }
    };

    buildMenuStructure(forms: Q2Form[]): any {
        const structure: any = {};
        let uid = 0;

        forms.forEach((form) => {
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

        return structure;
    }

    renderMenu = (menuStructure: any) => {
        const items = Object.entries(menuStructure)
            .filter(([key]) => key !== "__meta__")
            .map(([key, value]: [string, any]) => ({ key, ...value.__meta__, children: value }))
            .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));

        return items.map(item => {
            if (item.key && item.label === '-') {
                return <hr key={item.key} />;
            }

            if (item.label !== "" && item.key && item.key !== null) {
                return (
                    <button key={item.key} onClick={(e) => {
                        e.stopPropagation();
                        const form = this.props.q2forms.find(f => f.key === item.key);
                        if (form) showDialog(form);
                        this.hideDropdown();
                    }}>
                        {item.label}
                    </button>
                );
            }


            return (
                <div className='submenu' key={item.label}>
                    <button className='submenubtn'>{item.label}</button>
                    <div className='submenu-content'>
                        {this.renderMenu(item.children)}
                    </div>
                </div>
            );
        });
    };

    renderToolButtons = () => {
        return this.props.q2forms.map((form) => {
            const menutoolbar = form.menutoolbar;
            if (menutoolbar === 1 || menutoolbar === true) {
                const pathParts = form.menubarpath.split('|');
                const label = pathParts[pathParts.length - 1];
                return (
                    <button key={form.key} onClick={() => {
                        showDialog(form);
                        this.hideDropdown();
                    }} className='toolButton'>
                        {label}
                    </button>
                );
            }
            return null;
        }).filter(Boolean);
    };

    openNewTab = () => {
        window.open('/', '_blank');
    };

    hideDropdown = () => {
        this.setState({ visibleDropdown: null, activated: false });
    };

    render() {
        const { visibleDropdown, activated } = this.state;
        const menuStructure = this.buildMenuStructure(this.props.q2forms);
        const {
            // userName,
            // guestName,
            // guestLogo,
            isLoggedIn,
            // navigate,
        } = this.props;

        const isCurentDark = document.documentElement.classList.contains("dark");
        const customMainMenu = GetQ2AppInstance()?.hookMainMenuWidget();

        const items = Object.entries(menuStructure)
            .map(([key, value]: [string, any]) => ({ key, ...value.__meta__, children: value }))
            .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));

        return (
            <nav className='MainMenuBar'>
                <House className={"MainMenuIcon "}
                    onClick={() => GetQ2AppInstance()?.closeAllDialogs()} />
                <ArrowBigLeft className="MainMenuIcon "
                    onClick={() => GetQ2AppInstance()?.closeTopDialog()} />
                <div className='menuItems' ref={this.menuRef} >
                    {items.map((item) => (
                        <div
                            className='dropdown'
                            key={item.seq}
                            onMouseEnter={() => {
                                if (activated) this.setState({ visibleDropdown: item.label });
                            }}
                            onClick={() => {
                                if (!activated) {
                                    this.setState({ activated: true });
                                }
                                this.setState({ visibleDropdown: item.label });
                            }}
                        >
                            <button className='dropbtn'>{item.label}</button>
                            <div
                                className='dropdown-content'
                                style={{ display: visibleDropdown === item.label ? 'block' : 'none' }}
                            >
                                {this.renderMenu(item.children)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className='spacer1'></div>
                <div className='toolButtons'>
                    {this.renderToolButtons()}
                </div>
                <div className='spacer9'></div>
                {customMainMenu ? customMainMenu : null}
                <span title={isLoggedIn ? "Logout" : "Login"}>
                    {isLoggedIn ?
                        <LogOut className={"MainMenuIcon"}
                            onClick={GetQ2AppInstance()?.login_logout} />
                        :
                        <LogIn className={"MainMenuIcon"}
                            onClick={GetQ2AppInstance()?.login_logout} />
                    }
                </span>
                <span title={isCurentDark ? "Light theme" : "Dark theme"}>
                    {isCurentDark ?
                        <Sun className={"MainMenuIcon"}
                            onClick={GetQ2AppInstance()?.toggleTheme} />
                        :
                        <Moon className={"MainMenuIcon"}
                            onClick={GetQ2AppInstance()?.toggleTheme} />
                    }
                </span>
            </nav>
        );
    }
}

export default MainMenu;
