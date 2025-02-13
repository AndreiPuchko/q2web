import React, { useRef } from 'react';
import './DialogContainer.css';

const DialogContainer: React.FC = ({ children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dialog.offsetWidth;
    const startHeight = dialog.offsetHeight;
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
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="dialog-container" ref={dialogRef}>
      <div className="dialog-header" onMouseDown={onMouseDown}>
        Drag here
      </div>
      <div className="dialog-content">
        {children}
      </div>
      <div className="dialog-resizer" onMouseDown={onResizeMouseDown}></div>
    </div>
  );
};

export default DialogContainer;
