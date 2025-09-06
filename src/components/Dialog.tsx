import React from 'react';
import './Dialog.css';
import Cookies from 'js-cookie';
import Form from './Form';

import { Q2Form } from "../q2_modules/Q2Form";
import { GiConsoleController } from 'react-icons/gi';

interface DialogProps {
  onClose: () => void;
  zIndex: number;
  q2form: Q2Form;
  isTopDialog: boolean;
  dialogIndex: number;
}

interface DialogState {
  isMaximized: boolean;
}

class Dialog extends React.Component<DialogProps, DialogState> {
  dialogRef: React.RefObject<HTMLDivElement | null>;
  prevStateRef: { width: string, height: string, left: string, top: string } | null;

  // add a snapshot ref to detect unchanged dialog-container
  prevDialogSnapshotRef: { clientWidth: number; clientHeight: number; scrollWidth: number; scrollHeight: number; childCount: number } | null;

  constructor(props: DialogProps) {
    super(props);
    this.dialogRef = React.createRef<HTMLDivElement>();
    this.prevStateRef = null;
    this.prevDialogSnapshotRef = null;
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

    // ensure layout is settled: resize children and run mouse-up sizing logic
    requestAnimationFrame(() => {
      this.resizeChildren();
      this.dialogHandleMouseUp();
      // extra pass to catch deferred layout changes
      requestAnimationFrame(() => this.dialogHandleMouseUp());
    });
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
      const computedStyle = window.getComputedStyle(dialogContent);
      const padding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
      const paddingHor = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
      const height = dialog.clientHeight - dialogHeader.clientHeight - padding - 5;
      const width = dialog.clientWidth - paddingHor - 5;
      child.style.height = `${height}px`;
      child.style.width = `${width}px`;


      const pxTargets = Array.from(child.querySelectorAll('.DataGrid, .DataGridRoot, .q2-report-editor-root, q2-scroll')) as HTMLElement[];
      pxTargets.forEach(el => {
        el.style.height = `${height}px`;
        el.style.width = `${width}px`;
        el.style.minHeight = '0';
        el.style.minWidth = '0';
        el.style.boxSizing = 'border-box';
      });

      // const percentTargets = Array.from(child.querySelectorAll('.FormComponent, .Panel, .field-set-style, .form-group, .flex-column')) as HTMLElement[];
      // percentTargets.forEach(el => {
      //   // use 100% so these wrappers fill the pixel-sized ancestor
      //   el.style.height = '100%';
      //   el.style.minHeight = '0';
      //   el.style.boxSizing = 'border-box';
      // });
    });
  };


  dialogHandleMouseUp1 = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const content = dialog.querySelector(".dialog-content") as HTMLElement;
    if (!content) return;

    //
    // 1. First pass: compute minimum required size from children
    //
    const { minW, minH } = this.computeMinSize(content);

    const clientW = content.clientWidth;
    const clientH = content.clientHeight;

    // Grow only if dialog is smaller than min
    const finalW = Math.max(clientW, minW);
    const finalH = Math.max(clientH, minH);

    if (finalW > clientW) dialog.style.width = `${finalW}px`;
    if (finalH > clientH) dialog.style.height = `${finalH}px`;

    //
    // 2. Second pass (deferred): wait for browser to recalc layout
    //
    requestAnimationFrame(() => {
      const hasVerticalScrollbar = dialog.scrollHeight > dialog.clientHeight;
      const hasHorizontalScrollbar = dialog.scrollWidth > dialog.clientWidth;

      // Collect resizable elements (textarea, DataGrid)
      const resizableElements = Array.from(
        dialog.querySelectorAll(
          "textarea.Q2Text, .DataGrid"
        )
      ) as HTMLElement[];

      // Adjust resizable elements if scrollbars remain
      if (resizableElements.length > 0) {
        if (hasVerticalScrollbar) {
          resizableElements.forEach(el => {
            const minH = parseInt(el.dataset.minHeight || "50");
            el.style.height = Math.max(minH, el.clientHeight - 10) + "px";
          });
        }

        if (hasHorizontalScrollbar) {
          resizableElements.forEach(el => {
            const minW = parseInt(el.dataset.minWidth || "50");
            el.style.width = Math.max(minW, el.clientWidth - 10) + "px";
          });
        }
      }
    });
  };


  // Compute min-size recursively
  computeMinSize = (element: HTMLElement): { minW: number; minH: number } => {
    const isColumn = element.classList.contains("flex-column");

    if (element.classList.contains("Q2Text") ||
      element.classList.contains("DataGrid")) {
      // Growable leaf
      const minW = parseInt(element.dataset.minWidth || element.style.minWidth || "50");
      const minH = parseInt(element.dataset.minHeight || element.style.minHeight || "50");
      return { minW, minH };
    }

    if (element.classList.contains("ReportEditor")) {
      // Fixed-size leaf
      return {
        minW: element.offsetWidth,
        minH: element.offsetHeight,
      };
    }

    if (element.children.length > 0) {
      // Panel container
      const children = Array.from(element.children) as HTMLElement[];
      if (isColumn) {
        let minW = 0, minH = 0;
        children.forEach(child => {
          const { minW: cW, minH: cH } = this.computeMinSize(child);
          minW = Math.max(minW, cW);
          minH += cH;
        });
        return { minW, minH };
      } else {
        let minW = 0, minH = 0;
        children.forEach(child => {
          const { minW: cW, minH: cH } = this.computeMinSize(child);
          minW += cW;
          minH = Math.max(minH, cH);
        });
        return { minW, minH };
      }
    }

    // Default: fixed-size leaf
    return {
      minW: element.offsetWidth,
      minH: element.offsetHeight,
    };
  };




  dialogHandleMouseUp = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    // Snapshot current dialog metrics
    const snapshot = {
      clientWidth: dialog.clientWidth,
      clientHeight: dialog.clientHeight,
      scrollWidth: dialog.scrollWidth,
      scrollHeight: dialog.scrollHeight,
      childCount: dialog.children.length
    };

    // Early exit if nothing changed since last run
    const prev = this.prevDialogSnapshotRef;
    if (prev &&
      prev.clientWidth === snapshot.clientWidth &&
      prev.clientHeight === snapshot.clientHeight &&
      // prev.scrollWidth === snapshot.scrollWidth &&
      // prev.scrollHeight === snapshot.scrollHeight &&
      prev.childCount === snapshot.childCount) {
      return;
    }

    // store snapshot for next invocation
    this.prevDialogSnapshotRef = snapshot;

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

    // update snapshot after possible size changes
    this.prevDialogSnapshotRef = {
      clientWidth: dialog.clientWidth,
      clientHeight: dialog.clientHeight,
      scrollWidth: dialog.scrollWidth,
      scrollHeight: dialog.scrollHeight,
      childCount: dialog.children.length
    };
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
      this.setState({ isMaximized: true }, this.dialogHandleMouseUp);
    } else {
      if (this.prevStateRef) {
        dialog.style.width = this.prevStateRef.width;
        dialog.style.height = this.prevStateRef.height;
        dialog.style.left = this.prevStateRef.left;
        dialog.style.top = this.prevStateRef.top;
      }
      this.resizeChildren()
      this.setState({ isMaximized: false }, this.dialogHandleMouseUp);
    }
    // this.dialogHandleMouseUp();
    this.resizeChildren()
  };

  render() {
    const { onClose, q2form, zIndex, isTopDialog, dialogIndex } = this.props;
    const { isMaximized } = this.state;
    q2form.dialogIndex = dialogIndex;

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
          <Form q2form={q2form} onClose={onClose} isTopDialog={isTopDialog} />
        </div>

      </div>
    );
  }
}


export default Dialog;
