import React, { useRef, useEffect } from 'react';
import './Dialog.css';
import Cookies from 'js-cookie';

interface DialogProps {
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ children, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const saveDialogState = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const dialogState = {
      width: dialog.style.width,
      height: dialog.style.height,
      left: dialog.style.left,
      top: dialog.style.top,
    };

    Cookies.set('dialogState', JSON.stringify(dialogState));
  };

  const loadDialogState = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const dialogState = Cookies.get('dialogState');
    if (dialogState) {
      const { width, height, left, top } = JSON.parse(dialogState);
      dialog.style.width = width;
      dialog.style.height = height;
      dialog.style.left = left;
      dialog.style.top = top;
    }
  };

  const onMoveMouseDown = (e: React.MouseEvent) => {
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

  const onResizeMouseDown = (e: React.MouseEvent) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dialog.offsetWidth;
    const startHeight = dialog.offsetHeight;

    const onMouseMove = (e: MouseEvent) => {
      dialog.style.width = `${startWidth + e.clientX - startX}px`;
      dialog.style.height = `${startHeight + e.clientY - startY}px`;
      resizeChildren();
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
      if (child.getAttribute('_can_grow_width') === 'true') {
        const padding = parseFloat(window.getComputedStyle(dialogContent).paddingLeft) + parseFloat(window.getComputedStyle(dialogContent).paddingRight);
        const width = dialog.clientWidth - padding;
        child.style.width = `${width}px`;
      }
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

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="dialog-container" ref={dialogRef}>
      <div className="dialog-header" onMouseDown={onMoveMouseDown}>
        Dialog Header
        <button className="close-button" onClick={onClose}>&#10006;</button>
      </div>
      <div className="dialog-content">
        {children}
      </div>
      <div className="dialog-resizer" onMouseDown={onResizeMouseDown}></div>
    </div>
  );
};

export default Dialog;
