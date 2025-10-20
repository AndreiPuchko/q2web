import { Component } from 'react';
import MainMenu from '../components/MainMenu';
import Dialog from '../components/Dialog';
import Cookies from "js-cookie";
import { Q2Form } from "../q2_modules/Q2Form";
import './Q2App.css';
import { apiRequest } from "./Q2Api"

export interface Q2AppProps {
  q2forms: Array<Q2Form>;
}

export interface Q2AppState {
  dialogs: { [key: string]: Q2Form };
  theme: string | null;
  isLoggedIn: boolean;
  userName: string;
  userUid: string;
  isLoginDialogOpen: boolean;
}

export class Q2App<P extends Q2AppProps, S extends Q2AppState> extends Component<P, S> {
  static instance: Q2App<any, any> | null = null;
  static apiUrl: string = "";

  constructor(props: Q2AppProps) {
    super(props as P);
    Q2App.instance = this;
    this.state = {
      dialogs: {},
      theme: this.detectTheme(),
      isLoggedIn: false,
      userName: "",
      userUid: "",
      isLoginDialogOpen: false,
    } as unknown as Readonly<S>;
  }

  detectTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  componentDidMount() {
    this.applyTheme();
    window.addEventListener('q2-theme-changed', this.handleThemeChanged);
    this.setUser().then(() => this.showHome());
    window.addEventListener("popstate", this.handleBackButton);
  }

  componentWillUnmount() {
    window.removeEventListener('q2-theme-changed', this.handleThemeChanged);
    window.removeEventListener("popstate", this.handleBackButton);
  }

  handleBackButton = (event: any) => {
    event.preventDefault();
    this.closeTopDialog();
  };

  handleThemeChanged = () => {
    const theme = this.detectTheme();
    this.setState({ theme });
  };

  componentDidUpdate(prevState: any) {
    if (prevState.theme !== this.state.theme) this.applyTheme();
  }

  applyTheme = () => {
    document.documentElement.classList.toggle("dark", this.state.theme === "dark");
  };

  toggleTheme = () => {
    this.setState(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      Cookies.set("theme", newTheme, { expires: 365 * 10 });
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return { theme: newTheme };
    });
  };

  editUserProfile =() => {
    this.showMsg("Under construction...");
  }

  login_logout = async () => {
    if (this.state.isLoggedIn) {
      await this.handleLogout();
    } else {
      if (this.state.isLoginDialogOpen) return;
      const AuthForm = new Q2Form("", "Auth Form", "authform", { class: "LP-AuthForm" });
      AuthForm.hasOkButton = true;
      AuthForm.hasCancelButton = true;
      AuthForm.hasMaxButton = false;
      AuthForm.resizeable = false;
      AuthForm.moveable = false;
      AuthForm.width = window.innerWidth < 600 ? "100%" : "65%";
      AuthForm.height = "auto";
      AuthForm.top = "10%"
      // AuthForm.frameless = true;

      AuthForm.add_control("/t", "Login");
      AuthForm.add_control("email", "Email");
      AuthForm.add_control("password", "Password", { pic: "*" });

      AuthForm.add_control("/t", "Register");
      AuthForm.add_control("reg_name", "Nickname");
      AuthForm.add_control("reg_email", "Email");
      AuthForm.add_control("reg_pass1", "Password", { pic: "*" });
      AuthForm.add_control("reg_pass2", "Repeat password", { pic: "*" });
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
            if (close) {
              form.close();
            }
            else {
              console.log("Login failed");
              // this.showMsg("Login failed");
            }
          });
        } else {
          const { reg_name, reg_email, reg_pass1, reg_pass2 } = form.s;
          this.handleRegister(reg_name, reg_email,
            reg_pass1, reg_pass2, remember).then((close) => {
              if (close) form.close();
            });
        }
        console.log("submit")
        return false;
      };

      AuthForm.hookClosed = () => {
        this.setState({ isLoginDialogOpen: false });
        return true;
      }

      this.setState(
        { isLoginDialogOpen: true },
        () => this.showDialog(AuthForm)
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
      this.showMsg("Login failed");
      return false
    }
    return true
  };

  handleLogout = async () => {
    await apiRequest("/logout", { method: "POST" });
    this.setState({ isLoggedIn: false, userName: "", userUid: "" }, () => this.showHome())
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
    } catch {
      console.log("Not logged in");
    }
  };

  showMsg = (msg: string, title?: string): void => {
    if (!title) title = "Message";
    const msgBox = new Q2Form("", title, "msgbox", {
      hasMaxButton: false,
      hasOkButton: true,
      width: "65%",
      top: "10%",
    });

    msgBox.add_control("/v");
    msgBox.add_control("text", "", {
      readonly: true,
      data: msg,
      control: "text"
    });
    this.showDialog(msgBox);
  }

  showDialog = (q2form: Q2Form) => {
    const key = `dlg_${Math.random().toString(36).substr(2, 9)}`;
    history.pushState({ key }, "", window.location.href);
    this.setState(prevState => ({
      dialogs: { ...prevState.dialogs, [key]: q2form }
    }));
  };

  closeDialog = (key: string) => {
    this.setState(prevState => {
      const newDialogs = { ...prevState.dialogs };
      delete newDialogs[key];
      return { dialogs: newDialogs };
    }, () => {
      if (Object.keys(this.state.dialogs).length === 0) this.showHome();
    });
  };


  closeAllDialogs = () => {
    this.setState({ dialogs: {} }, () => this.showHome());
  };


  closeTopDialog = () => {
    const keys = Object.keys(this.state.dialogs);
    if (keys.length > 0) this.closeDialog(keys[keys.length - 1]);
  };

  showHome = () => {
    if (Object.keys(this.state.dialogs).length === 0) {
      this.props.q2forms.forEach(el => {
        if (el.key.startsWith("autorun")) this.showDialog(el);
      });
    }
  };

  hookMainMenuWidget = (): any => null;

  render() {
    const dialogKeys = Object.keys(this.state.dialogs);
    return (
      <>
        <MainMenu q2forms={this.props.q2forms} isLoggedIn={this.state.isLoggedIn} />
        {dialogKeys.map((key, index) => (
          <Dialog
            key={key}
            onClose={() => this.closeDialog(key)}
            q2form={this.state.dialogs[key]}
            isTopDialog={index === dialogKeys.length - 1}
            dialogIndex={key}
          />
        ))}
      </>
    );
  }
}

export default Q2App;