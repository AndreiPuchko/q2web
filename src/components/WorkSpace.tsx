import Dialog from './Dialog';
import './WorkSpace.css';

const WorkSpace = ({ dialogs, onCloseDialog }) => {
  return (
    <div className='WorkSpace'>
      {dialogs.map((dialog, index) => (
        <Dialog key={index} onClose={() => onCloseDialog(index)} currentFormKey={dialog.key} />
      ))}
    </div>
  );
};

export default WorkSpace;
