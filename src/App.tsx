import React, { Component } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import Dialog from './components/Dialog';
// import { forms } from "./data_modules/data";
// import DataGrid from './components/DataGrid';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogs: [],
      zIndexMap: {}
    };
  }

  showDialog = (metaData) => {

    console.log(metaData);

    const newDialogIndex = this.state.dialogs.length;
    this.setState((prevState) => ({
      dialogs: [...prevState.dialogs, { key: metaData.key, metaData }],
      zIndexMap: { ...prevState.zIndexMap, [newDialogIndex]: newDialogIndex + 1 }
    }));
  };

  closeDialog = (index) => {
    this.setState((prevState) => {
      const newDialogs = prevState.dialogs.filter((_, i) => i !== index);
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
        <div className='WorkSpace'>
          {this.state.dialogs.map((dialog, index) => (
            <Dialog
              key={index}
              onClose={() => this.closeDialog(index)}
              metaData={dialog.metaData}
              isTopDialog={index === this.state.dialogs.length - 1}
              zIndex={this.state.zIndexMap[index] || 0}
              showDialog={this.showDialog} // Ensure showDialog is passed to Dialog
            />
          ))}
        </div>
      </>
    );
  }
}

export default App;
