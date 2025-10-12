import { Component } from 'react';
import MainMenu from '../components/MainMenu';
import Dialog from '../components/Dialog';
import Cookies from "js-cookie";
import { Q2Form } from "../q2_modules/Q2Form";
import './Q2App.css';
import { apiRequest } from "./Q2Api"


export interface Q2AppProps<T extends Q2Form = Q2Form> {
  q2forms: Array<T>;
}

export interface Q2AppState {
  zIndexMap: { [key: string]: any };
  dialogs: any[];
  theme: string | null;
  isLoggedIn: boolean; // No changes here, `isLoggedIn` is already in the state
  userName: string;
  userUid: number;
  isGuestDialogOpen: boolean;
  isLoginDialogOpen: boolean;
}

export class Q2App<T extends Q2Form = Q2Form> extends Component<Q2AppProps<T>, Q2AppState> {
  static instance: Q2App<any> | null = null; // Use `any` to allow for generic compatibility
  static apiUrl: string = "";

  constructor(props: Q2AppProps<T>) {
    super(props);
    Q2App.instance = this; // No error now since `instance` is typed as `Q2App<any> | null`

    this.state = {
      dialogs: [],
      zIndexMap: {},
      theme: this.detectTheme(),
      isLoggedIn: false,
      userName: "",
      userUid: 0,
      isGuestDialogOpen: false,
      isLoginDialogOpen: false,
    };
  }

  detectTheme = () => {
    // Try to get from localStorage first
    // return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Otherwise, use system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  componentDidMount() {
    this.applyTheme();
    window.addEventListener('q2-theme-changed', this.handleThemeChanged);
    this.setUser();
  }

  componentWillUnmount() {
    window.removeEventListener('q2-theme-changed', this.handleThemeChanged);
  }

  handleThemeChanged = () => {
    const theme = this.detectTheme();
    this.setState({ theme });
  };

  componentDidUpdate(prevState: any) {
    if (prevState.theme !== this.state.theme) {
      this.applyTheme();
    }
  }

  applyTheme = () => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(this.state.theme === 'light' ? 'theme-light' : 'theme-dark');
  };

  toggleTheme = () => {
    this.setState(
      prev => {
        const newTheme = prev.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        Cookies.set("theme", newTheme, { expires: 365 * 10 });
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        return { theme: newTheme };
      }
    );
  };

  login_logout = async () => {
    if (this.state.isLoggedIn) {
      await this.handleLogout();
    } else {
      const AuthForm = new Q2Form("", "Auth Form", "authform", { class: "LP-AuthForm" });
      AuthForm.hasOkButton = true;
      AuthForm.hasCancelButton = true;
      AuthForm.hasMaxButton = false;
      AuthForm.resizeable = false;
      AuthForm.moveable = false;
      AuthForm.width = "65%";
      AuthForm.height = "auto";
      AuthForm.top = "10%"
      // AuthForm.frameless = true;

      AuthForm.add_control("/t", "Login");
      AuthForm.add_control("email", "Email");
      AuthForm.add_control("password", "Password");

      AuthForm.add_control("/t", "Register");
      AuthForm.add_control("reg_name", "nickname");
      AuthForm.add_control("reg_email", "Email");
      AuthForm.add_control("reg_pass1", "Password");
      AuthForm.add_control("reg_pass2", "Repeat password");
      AuthForm.add_control("/");
      AuthForm.add_control("/h");
      AuthForm.add_control("remember", "Remember me", { control: "check", data: true });

      AuthForm.hookInputChanged = (form) => {
        if (form.w["tabWidget"].prevValue != form.s["tabWidget"]) {
          form.setState({ okButtonText: form.s["tabWidget"] });
        }
      };

      AuthForm.hookSubmit = (form) => {
        const { tabWidget, email, password, remember } = form.s;
        if (tabWidget === "Login") {
          this.handleLogin(email, password, remember).then((close) => {
            if (close) form.close();
            else {
              this.showMsg("Login failed");
            }
          });
        } else {
          const { reg_name, reg_email, reg_pass1, reg_pass2 } = form.s;
          this.handleRegister(reg_name, reg_email, reg_pass1, reg_pass2, remember).then((close) => {
            if (close) form.close();
          });
        }
        return false;
      };

      AuthForm.hookClosed = () => {
        this.setState({isLoginDialogOpen: false});
        return true;
      }

      this.setState(
        { isLoginDialogOpen: true },
        () => this.showDialog(AuthForm as T)
      );
    }
  }

  handleRegister = async (
    name: string,
    email: string,
    password: string,
    password2: string,
    remember: boolean
  ): Promise<boolean> => {
    try {
      const res = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, password2, remember }),
      });

      remember ? localStorage.setItem("rememberedEmail", email) : localStorage.removeItem("rememberedEmail");

      if ("error" in res) return false;
      this.setUser();
      return true;
    } catch (err) {
      console.error(err);
      this.showMsg("Register failed");
      return false;
    }
  };

  handleLogin = async (email: string, password: string, remember: boolean): Promise<boolean> => {
    try {
      await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember }),
      });
      if (remember) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      this.setUser();
    } catch (err) {
      console.log(err)
      // alert("Login failed");
      return false
    }
    return true
  };

  handleLogout = async () => {
    await apiRequest("/logout", { method: "POST" });
    this.setState({ isLoggedIn: false }, () => this.showHome())
  };

  setUser = async () => {
    try {
      const me = await apiRequest("/me");
      this.setState({
        userName: me.user.name,
        userUid: me.user.uid,
        isLoggedIn: true,
        isLoginDialogOpen: false
      });
      this.closeAllDialogs();
    }
    catch {
      console.log("Not logged in");

    }
  };

  showMsg = (msg: string): void => {
    const msgBox = new Q2Form("", "msgbox", "msgbox", {
      hasMaxButton: false,
      hasOkButton: true,
      resizeable: false,
    });

    msgBox.add_control("/v");
    msgBox.add_control("text", "", {
      readonly: true,
      data: msg,
      control: "text"
    });
    this.showDialog(msgBox as T); // Explicitly assert the type of msgBox to T
  }

  showDialog = (q2form: T) => {
    const newDialogIndex = this.state.dialogs.length;
    this.setState((prevState) => ({
      dialogs: [...prevState.dialogs, { key: (q2form as any).key, q2form }],
      zIndexMap: { ...prevState.zIndexMap, [newDialogIndex]: newDialogIndex + 1 }
    }));
  };

  closeDialog = (index: number) => {
    this.setState((prevState) => {
      const newDialogs = prevState.dialogs.filter((_: any, i: number) => i !== index);
      const newZIndexMap = { ...prevState.zIndexMap };
      delete newZIndexMap[index];
      return {
        dialogs: newDialogs,
        zIndexMap: newZIndexMap
      };
    });
  };

  closeAllDialogs = () => {
    this.setState({ dialogs: [], zIndexMap: {} },
      () => this.showHome());
  };

  closeTopDialog = () => {
    if (this.state.dialogs.length > 0) {
      this.closeDialog(this.state.dialogs.length - 1);
    }
  };

  showHome = () => {
    if (this.state.dialogs.length === 0) {
      this.props.q2forms.forEach(el => {
        if (el.key === "autorun") this.showDialog(el);
      });
    }
  };

  render() {
    return (
      <>
        <MainMenu
          q2forms={this.props.q2forms}
          isLoggedIn={this.state.isLoggedIn}
          isLoginDialogOpen={this.state.isLoginDialogOpen} />
        {this.state.dialogs.map((dialog: any, index: any) => (
          <Dialog
            key={index}
            onClose={() => this.closeDialog(index)}
            q2form={dialog.q2form}
            isTopDialog={index === this.state.dialogs.length - 1}
            zIndex={this.state.zIndexMap[index] || 0}
            dialogIndex={index}
          />
        ))}
      </>
    );
  }
}

export default Q2App;
