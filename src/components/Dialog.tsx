import React, { useRef, useEffect } from 'react';
import './Dialog.css';
import Cookies from 'js-cookie';
import DataGrid from './DataGrid';
import Form from './Form';
import { Q2Form } from "../data_modules/data";

interface DialogProps {
  onClose: () => void;
  zIndex: number;
  metaData: Q2Form;
  isTopDialog: boolean;
  rowData?: any;
  showDialog: () => void;
}

const Dialog: React.FC<DialogProps> = ({ onClose, metaData, zIndex, isTopDialog, rowData, showDialog }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  if (!metaData) {
    return null;
  }

  const saveDialogState = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const dialogState = {
      width: dialog.style.width,
      height: dialog.style.height,
      left: dialog.style.left,
      top: dialog.style.top,
    };

    const title = metaData.title.replace(/\[.*?\]/g, '');
    Cookies.set(`dialogState_${title}`, JSON.stringify(dialogState));
  };

  const loadDialogState = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const title = metaData.title.replace(/\[.*?\]/g, '');
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

  const onMoveMouseDown = (e: React.MouseEvent) => {
    if (!isTopDialog) return;

    const dialog = dialogRef.current;
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
      saveDialogState();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const resizeChildren = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const dialogHeader = dialog.querySelector('.dialog-header') as HTMLElement;
    const dialogResizer = dialog.querySelector('.dialog-resizer') as HTMLElement;
    const dialogContent = dialog.querySelector('.dialog-content') as HTMLElement;

    const childrenArray = Array.from(dialogContent.children) as HTMLElement[];
    childrenArray.forEach(child => {
      if (child.getAttribute('_can_grow_height') === 'true') {
        const padding = parseFloat(window.getComputedStyle(dialogContent).paddingTop) + parseFloat(window.getComputedStyle(dialogContent).paddingBottom);
        const height = dialog.clientHeight - dialogHeader.clientHeight - dialogResizer.clientHeight - padding;
        child.style.height = `${height}px`;
      }
      // if (child.getAttribute('_can_grow_width') === 'true') {
      //   const padding = parseFloat(window.getComputedStyle(dialogContent).paddingLeft) + parseFloat(window.getComputedStyle(dialogContent).paddingRight);
      //   const width = dialog.clientWidth - padding;
      //   child.style.width = `${width}px`;
      // }
    });
  };

  useEffect(() => {
    loadDialogState();

    const dialog = dialogRef.current;
    if (!dialog) return;

    const resizeObserver = new ResizeObserver(() => {
      resizeChildren();
    });

    resizeObserver.observe(dialog);

    const dialogHandleMouseUp = () => {
      // Check for scrollbars and increment size by 1 pixel until they are gone
      const hasVerticalScrollbar = dialog.scrollHeight > dialog.clientHeight;
      const hasHorizontalScrollbar = dialog.scrollWidth > dialog.clientWidth;

      // const elements = dialog.querySelectorAll("[class^=Q2Text]");
      const elements = Array.from(dialog.querySelectorAll("[class^=Q2Text]") as unknown as HTMLCollectionOf<HTMLElement>)
      if (elements) {
        elements.forEach(element => {
          element.style.height = "auto";
          // console.log(element);
        });
      }

      if (hasVerticalScrollbar) {
        dialog.style.height = `${dialog.scrollHeight + 3}px`;
      }
      if (hasHorizontalScrollbar) {
        dialog.style.width = `${dialog.scrollWidth + 3}px`;
      }

      if (elements.length > 0) {
        console.log(elements);
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

    dialog.addEventListener('mouseup', dialogHandleMouseUp);

    // Call dialogHandleMouseUp when the form is shown
    dialogHandleMouseUp();

    return () => {
      resizeObserver.disconnect();
      dialog.removeEventListener('mouseup', dialogHandleMouseUp);
    };
  }, []);

  const { data } = metaData;
  const isDataGrid = data && data.length > 0;

  return (
    <div
      className={`dialog-container ${isTopDialog ? '' : 'disabled'}`}
      ref={dialogRef}
      style={{ zIndex }}
    >
      <div className="dialog-header" onMouseDown={onMoveMouseDown}>
        <b>{metaData["title"]}</b>
        <button className="close-button" onClick={onClose}>&#10006;</button>
      </div>
      <div className="dialog-content">
        {isDataGrid ? (
          <DataGrid metaData={metaData} onClose={onClose} showDialog={showDialog} isTopDialog={isTopDialog} />
        ) : (
          <Form metaData={metaData} onClose={onClose} rowData={rowData} isTopDialog={isTopDialog} />
        )}
      </div>
      <div className="dialog-resizer" ></div>
    </div>
  );
};

export default Dialog;
