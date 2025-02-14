import DataGrid from './DataGrid';
import Dialog from './Dialog';
import './WorkSpace.css';

const WorkSpace = ({ dialogs, onCloseDialog }) => {
    return (
        <div className='WorkSpace'>
            {dialogs.map((dialog, index) => (
                <Dialog key={index} onClose={() => onCloseDialog(index)}>
                    <DataGrid currentFormKey={dialog.key} />
                </Dialog>
            ))}
        </div>
    );
};

export default WorkSpace;
