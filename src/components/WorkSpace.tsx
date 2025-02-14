import { useState } from 'react';
import DataGrid from './DataGrid';
import Dialog from './Dialog';
import './WorkSpace.css';

const WorkSpace = ({ children }) => {
  const [dialogs, setDialogs] = useState([]);

  const showDialog = (key) => {
    setDialogs([...dialogs, { key }]);
  };

  const closeDialog = (index) => {
    setDialogs(dialogs.filter((_, i) => i !== index));
  };

  return (
    <div className='WorkSpace'>
      {children(showDialog)}
      {dialogs.map((dialog, index) => (
        <Dialog key={index} onClose={() => closeDialog(index)}>
          <DataGrid currentFormKey={dialog.key} />
        </Dialog>
      ))}
    </div>
  );
};

export default WorkSpace;
