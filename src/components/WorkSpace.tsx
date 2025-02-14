import Dialog from './Dialog';
import './WorkSpace.css';

const WorkSpace = ({ dialogs, onCloseDialog, zIndexMap }) => {
  return (
    <div className='WorkSpace'>
      {dialogs.map((dialog, index) => (
        <Dialog 
          key={index} 
          onClose={() => onCloseDialog(index)} 
          currentFormKey={dialog.key} 
          isTopDialog={index === dialogs.length - 1}
          zIndex={zIndexMap[index] || 0}
        />
      ))}
    </div>
  );
};

export default WorkSpace;
