import React, { useRef, useEffect } from 'react';
import './Dialog.css';

const Dialog: React.FC = ({ children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    resizeChildren();
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

    console.log('!Dialog content dimensions:', dialogContent.clientHeight, dialogContent.offsetHeight);
    const childrenArray = Array.from(dialogContent.children) as HTMLElement[];
    childrenArray.forEach(child => {
      if (child.getAttribute('_can_grow_height') === 'true') {
        console.log('Resizing child height:', child.style.height);
        const height = dialog.offsetHeight - dialogHeader.offsetHeight - dialogResizer.offsetHeight -  20;
        child.style.height = `${height}px`;
      }
      if (child.getAttribute('_can_grow_width') === 'true') {
        child.style.width = `${dialogContent.clientWidth}px`;
      }
    });
  };

  useEffect(() => {
    resizeChildren();
  }, []);

  return (
    <div className="dialog-container" ref={dialogRef} onMouseDown={onResizeMouseDown}>
      <div className="dialog-header" onMouseDown={onMoveMouseDown}>
        Drag here
      </div>
      <div className="dialog-content">
        {children}
      </div>
      <div className="dialog-resizer"></div>
    </div>
  );
};

export default Dialog;
