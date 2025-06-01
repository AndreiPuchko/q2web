import { Component } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import Dialog from './components/Dialog';



class App extends Component<{}, { zIndexMap: { [key: string]: any }, dialogs: any, theme: string }> {
  constructor(props: object) {
    super(props);
    this.state = {
      dialogs: [],
      zIndexMap: {},
      theme: this.detectTheme()
    };
  }

  detectTheme = () => {
    // Try to get from localStorage first
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
  }

  componentDidUpdate(prevProps: {}, prevState: any) {
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
        return { theme: newTheme };
      }
    );
  };

  showDialog = (metaData: { key: any; }) => {
    const newDialogIndex = this.state.dialogs.length;
    this.setState((prevState) => ({
      dialogs: [...prevState.dialogs, { key: metaData.key, metaData }],
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
        <MainMenu showDialog={this.showDialog} />
        <button
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            zIndex: 99999,
            padding: '0.3em 1em',
            borderRadius: '0.5em',
            border: '1px solid #888',
            background: 'var(--dialog-bg)',
            color: 'inherit',
            cursor: 'pointer'
          }}
          onClick={this.toggleTheme}
          title="Toggle theme"
        >
          {this.state.theme === 'light' ? '🌞' : '🌙'}
        </button>
        <div className='WorkSpace'>
          {this.state.dialogs.map((dialog: any, index: any) => (
            <Dialog
              key={index}
              onClose={() => this.closeDialog(index)}
              metaData={dialog.metaData}
              isTopDialog={index === this.state.dialogs.length - 1}
              zIndex={this.state.zIndexMap[index] || 0}
              showDialog={this.showDialog}
            />
          ))}
        </div>
      </>
    );
  }
}

export default App;
