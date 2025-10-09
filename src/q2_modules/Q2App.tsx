import { Component } from 'react';
import MainMenu from '../components/MainMenu';
import Dialog from '../components/Dialog';
import Cookies from "js-cookie";
import { Q2Form } from "../q2_modules/Q2Form";
import './Q2App.css';


interface Q2AppProps {
  q2forms: Array<Q2Form>
}

interface Q2AppState {
  zIndexMap: { [key: string]: any };
  dialogs: any[];
  theme: string | null;
  isLoggedIn: boolean;
}

export class Q2App extends Component<Q2AppProps, Q2AppState> {
  static instance: Q2App | null = null;

  constructor(props: Q2AppProps) {
    super(props);
    Q2App.instance = this;

    this.state = {
      dialogs: [],
      zIndexMap: {},
      theme: this.detectTheme(),
      isLoggedIn: false
    };
  }

  detectTheme = () => {
    // Try to get from localStorage first
    return 'light';
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

  showDialog = (q2form: Q2Form) => {
    const newDialogIndex = this.state.dialogs.length;
    this.setState((prevState) => ({
      dialogs: [...prevState.dialogs, { key: q2form.key, q2form: q2form }],
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

  render() {
    return (
      <>
        <MainMenu q2forms={this.props.q2forms} isLoggedIn={this.state.isLoggedIn} />
        <div className='WorkSpace'>
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
        </div>
      </>
    );
  }
}

export default Q2App;
