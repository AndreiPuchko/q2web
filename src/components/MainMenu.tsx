import React from 'react';
import { Q2Form } from "../q2_modules/Q2Form";
import { showDialog } from '../q2_modules/Q2Api';
import { Q2Button } from "./widgets/Button"
import { Q2Control } from "../q2_modules/Q2Form"
import { GetQ2AppInstance } from "../q2_modules/Q2Api"
import { House, ArrowBigLeft } from "lucide-react";

import './MainMenu.css';

interface MainMenuProps {
    q2forms: Array<Q2Form>
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

    login_logout = async () => {
        if (this.props.isLoggedIn) {
            await GetQ2AppInstance()?.handleLogout();
        }
        else {
            const AuthForm = new Q2Form("", "Auth Form", "authform", { class: "LP-AuthForm" });
            AuthForm.hasOkButton = true;
            AuthForm.hasCancelButton = true;
            AuthForm.hasMaxButton = false;
            AuthForm.resizeable = false;
            AuthForm.moveable = false;
            AuthForm.width = "65%";
            AuthForm.height = "";

            AuthForm.add_control("/t", "Login")
            AuthForm.add_control("email", "Email")
            AuthForm.add_control("password", "Password")

            AuthForm.add_control("/t", "Register")
            AuthForm.add_control("reg_name", "nickname")
            AuthForm.add_control("reg_email", "Email")
            AuthForm.add_control("reg_pass1", "Password")
            AuthForm.add_control("reg_pass2", "Repeat password")
            AuthForm.add_control("/")
            AuthForm.add_control("/h")
            AuthForm.add_control("remember", "Remember me", { control: "check", data: true })

            AuthForm.hookInputChanged = (form) => {
                if (form.w["tabWidget"].prevValue != form.s["tabWidget"]) {
                    form.setState({ okButtonText: form.s["tabWidget"] });
                }
            }

            AuthForm.hookSubmit = (form) => {
                const { tabWidget, email, password, remember } = form.s;
                if (tabWidget === "Login") {
                    GetQ2AppInstance()?.handleLogin(email, password, remember).then((close) => {
                        if (close) form.close();
                    });
                } else {
                    const { reg_name, reg_email, reg_pass1, reg_pass2 } = form.s;
                    GetQ2AppInstance()?.handleRegister(reg_name, reg_email, reg_pass1, reg_pass2, remember).then((close) => {
                        if (close) form.close();
                    });
                }
                return false; // Return a boolean synchronously
            }
            showDialog(AuthForm)
        }
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


        const themaButtonText = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";

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
                <Q2Button {...{
                    column: new Q2Control(
                        "login",
                        !isLoggedIn ? "Login" : "Logout",
                        {
                            valid: this.login_logout,
                            class: "login-button"
                        })
                }} />
                <Q2Button {...{
                    column: new Q2Control(
                        "theme",
                        themaButtonText,
                        {
                            valid: () => GetQ2AppInstance()?.toggleTheme(),
                            class: "theme-button"
                        })
                }} />
                {/* <button className='newTabButton' onClick={this.openNewTab}><b>+</b></button> */}
            </nav>
        );
    }
}

export default MainMenu;
