import React from 'react';
import './Dialog.css';
import Cookies from 'js-cookie';
import DataGrid from './DataGrid';
import Form from './Form';
import { Q2Form } from "../q2_modules/Q2Form";

interface DialogProps {
  onClose: () => void;
  zIndex: number;
  q2form: Q2Form;
  isTopDialog: boolean;
  showDialog: (q2form: Q2Form) => void;
}

interface DialogState {
  isMaximized: boolean;
}

class Dialog extends React.Component<DialogProps, DialogState> {
  dialogRef: React.RefObject<HTMLDivElement | null>;
  prevStateRef: { width: string, height: string, left: string, top: string } | null;

  constructor(props: DialogProps) {
    super(props);
    this.dialogRef = React.createRef<HTMLDivElement>();
    this.prevStateRef = null;
    this.state = {
      isMaximized: false
    };
  }

  componentDidMount() {
    this.loadDialogState();
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeChildren();
    });
    this.resizeObserver.observe(dialog);

    dialog.addEventListener('mouseup', this.dialogHandleMouseUp);

    // Call dialogHandleMouseUp when the form is shown
    this.dialogHandleMouseUp();
  }

  componentWillUnmount() {
    const dialog = this.dialogRef.current;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (dialog) {
      dialog.removeEventListener('mouseup', this.dialogHandleMouseUp);
    }
  }

  resizeObserver: ResizeObserver | undefined;

  saveDialogState = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const dialogState = {
      width: dialog.style.width,
      height: dialog.style.height,
      left: dialog.style.left,
      top: dialog.style.top,
    };

    const title = this.props.q2form.title.replace(/\[.*?\]/g, '');
    Cookies.set(`dialogState_${title}`, JSON.stringify(dialogState));
  };

  loadDialogState = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const title = this.props.q2form.title.replace(/\[.*?\]/g, '');
    const dialogState = Cookies.get(`dialogState_${title}`);
    if (dialogState) {
      const { width, height, left, top } = JSON.parse(dialogState);
      const menuBarHeight = document.querySelector('.MenuBar')?.clientHeight || 0;
      dialog.style.width = width;
      dialog.style.height = height;
      dialog.style.left = left;
      dialog.style.top = `${parseFloat(top) + menuBarHeight}px`;
    } else {
      const workspace = document.querySelector('.WorkSpace');
      if (workspace) {
        const workspaceRect = workspace.getBoundingClientRect();
        dialog.style.left = `${(workspaceRect.width - dialog.offsetWidth) / 2}px`;
        dialog.style.top = `${(workspaceRect.height - dialog.offsetHeight) / 2}px`;
      }
    }
  };

  onMoveMouseDown = (e: React.MouseEvent) => {
    if (!this.props.isTopDialog) return;

    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = dialog.offsetLeft;
    const startTop = dialog.offsetTop;

    const onMouseMove = (e: MouseEvent) => {
      dialog.style.left = `${startLeft + e.clientX - startX}px`;
      dialog.style.top = `${startTop + e.clientY - startY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.saveDialogState();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  resizeChildren = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const dialogHeader = dialog.querySelector('.dialog-header') as HTMLElement;
    const dialogContent = dialog.querySelector('.dialog-content') as HTMLElement;

    const childrenArray = Array.from(dialogContent.children) as HTMLElement[];
    childrenArray.forEach(child => {
      const padding = parseFloat(window.getComputedStyle(dialogContent).paddingTop) + parseFloat(window.getComputedStyle(dialogContent).paddingBottom);
      const height = dialog.clientHeight - dialogHeader.clientHeight -  padding;
      child.style.height = `${height}px`;
    });
  };

  dialogHandleMouseUp = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;
    const hasVerticalScrollbar = dialog.scrollHeight > dialog.clientHeight;
    const hasHorizontalScrollbar = dialog.scrollWidth > dialog.clientWidth;
    const elements = Array.from(dialog.querySelectorAll("[class^=Q2Text]") as unknown as HTMLCollectionOf<HTMLElement>)
    if (elements) {
      elements.forEach(element => {
        element.style.height = "auto";
      });
    }
    if (hasVerticalScrollbar) {
      dialog.style.height = `${dialog.scrollHeight + 3}px`;
    }
    if (hasHorizontalScrollbar) {
      dialog.style.width = `${dialog.scrollWidth + 3}px`;
    }
    if (elements.length > 0) {
      while (dialog.scrollHeight === dialog.clientHeight) {
        elements.forEach(element => {
          element.style.height = `${element.clientHeight + 1}px`;
        });
      }
      if (dialog.scrollHeight > dialog.clientHeight) {
        elements.forEach(element => {
          element.style.height = `${element.clientHeight - 10}px`;
        });
      }
    }
  };

  handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    if (!this.state.isMaximized) {
      this.prevStateRef = {
        width: dialog.style.width,
        height: dialog.style.height,
        left: dialog.style.left,
        top: dialog.style.top,
      };
      // Maximize within workspace
      const workspace = document.querySelector('.WorkSpace') as HTMLElement;
      const mb = document.querySelector('.MainMenuBar') as HTMLElement;
      if (workspace) {
        const wsRect = workspace.getBoundingClientRect();
        dialog.style.left = "0px";
        dialog.style.top = `${mb.offsetHeight}px`;
        dialog.style.width = `${wsRect.width - 2}px`;
        dialog.style.height = `${wsRect.height - mb.offsetHeight - 2}px`;
      } else {
        dialog.style.left = "0px";
        dialog.style.top = "0px";
        dialog.style.width = window.innerWidth + "px";
        dialog.style.height = window.innerHeight + "px";
      }
      this.resizeChildren()
      this.setState({ isMaximized: true },  this.dialogHandleMouseUp);
    } else {
      if (this.prevStateRef) {
        dialog.style.width = this.prevStateRef.width;
        dialog.style.height = this.prevStateRef.height;
        dialog.style.left = this.prevStateRef.left;
        dialog.style.top = this.prevStateRef.top;
      }
      this.resizeChildren()
      this.setState({ isMaximized: false },  this.dialogHandleMouseUp);
    }
    // this.dialogHandleMouseUp();
    this.resizeChildren()
  };

  render() {
    const { onClose, q2form, zIndex, isTopDialog, showDialog } = this.props;
    const { isMaximized } = this.state;
    const { data } = q2form;
    const isDataGrid = data && data.length > 0;

    if (!q2form) {
      return null;
    }

    return (
      <div
        className={`dialog-container ${isTopDialog ? '' : 'disabled'} ${isMaximized ? "maximized" : ""}`}
        ref={this.dialogRef}
        style={{ zIndex }}
      >
        <div className={`dialog-header ${isTopDialog ? '' : 'disabled'}`} onMouseDown={this.onMoveMouseDown}>
          <b>{q2form["title"]}</b>
          <div>
            {q2form.hasMaxButton ? (
              <button className="max-button" onClick={this.handleMaximize}>
                {isMaximized ? "🗗" : "🗖"}
              </button>
            ) : ""}
            <button className="close-button" onClick={onClose}>&#10006;</button>
          </div>
        </div>

        <div className="dialog-content">
          {isDataGrid ? (
            <DataGrid q2form={q2form} onClose={onClose} showDialog={showDialog} isTopDialog={isTopDialog} />
          ) : (
            <Form q2form={q2form} onClose={onClose} isTopDialog={isTopDialog} />
          )}
        </div>

      </div>
    );
  }
}

export default Dialog;
