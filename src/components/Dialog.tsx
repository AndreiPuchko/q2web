import React from 'react';
import './Dialog.css';
import Cookies from 'js-cookie';
import Q2FrontForm from './Q2FrontForm';

import { Q2Form } from "../q2_modules/Q2Form";

interface DialogProps {
  onClose: () => void;
  q2form: Q2Form;
  isTopDialog: boolean;
  dialogIndex: string;
}

interface DialogState {
  isMaximized: boolean;
}

const growableHeightClasses = `textarea, 
                    .Q2DataList-scrollarea, 
                    .q2-scroll, 
                    .q2-report-editor-root`;

const growableWidthClasses = `
                    .Q2DataList, 
                    .q2-scroll, 
                    .q2-report-editor-root`;

type Point = { x: number; y: number };

// Helper to get {x, y} from mouse or touch event
const getPoint = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): Point => {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else {
    const mouseEvent = e as MouseEvent;
    return { x: mouseEvent.clientX, y: mouseEvent.clientY };
  }
};

class Dialog extends React.Component<DialogProps, DialogState> {
  dialogRef: React.RefObject<HTMLDivElement | null>;
  prevStateRef: { width: string, height: string, left: string, top: string } | null;
  // add a snapshot ref to detect unchanged dialog-container
  prevDialogSnapshotRef: { clientWidth: number; clientHeight: number; scrollWidth: number; scrollHeight: number; childCount: number } | null;
  _reduceRaf = null;
  _reduceRunning = false;

  constructor(props: DialogProps) {
    super(props);
    this.dialogRef = React.createRef<HTMLDivElement>();
    this.prevStateRef = null;
    this.prevDialogSnapshotRef = null;
    this.state = {
      isMaximized: false
    };
    this.props.q2form.check_frameless();
  }

  componentDidMount() {
    this.loadDialogState();
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    dialog.style.overflow = this.props.q2form.resizeable ? "hidden" : "none"

    this.set_resize_move_icons()

    dialog.addEventListener('mouseup', this.dialogHandleMouseUp);

    window.addEventListener('resize', this.fitHeights);

    // ensure layout is settled: resize children and run mouse-up sizing logic
    if (!this.props.q2form.resizeable) {
      this.fitHeights()
      // this.fitWidths()
    }
    if (this.props.q2form.resizeable) {
      requestAnimationFrame(() => {
        this.dialogHandleMouseUp();
        // extra pass to catch deferred layout changes
        requestAnimationFrame(() => this.dialogHandleMouseUp());
      });
    }
  }

  set_resize_move_icons = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;
    if (!this.props.q2form.frameless) {
      const dialogHeader = dialog.querySelector('.dialog-header') as HTMLElement;
      dialogHeader.style.cursor = this.props.q2form.moveable && !this.state.isMaximized ? "move" : "auto";
    }
    else {
      // dialog.style.borderRadius = "unset";
    }
    dialog.style.resize = this.props.q2form.resizeable && !this.state.isMaximized ? "both" : "none"
  }

  componentDidUpdate(): void {
    this.set_resize_move_icons()
    this.fitHeights();
  }

  componentWillUnmount() {
    const dialog = this.dialogRef.current;
    if (dialog) {
      dialog.removeEventListener('mouseup', this.dialogHandleMouseUp);
    }
  }

  saveDialogState = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;


    const dialogState = {
      width: dialog.style.width,
      height: dialog.style.height,
      left: dialog.style.left,
      top: dialog.style.top,
    };
    this.normalizePosition();

    const title = this.props.q2form.title.replace(/\[.*?\]/g, '');
    Cookies.set(`dialogState_${title}`, JSON.stringify(dialogState));
  };

  normalizePosition = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;
    const left = dialog.offsetLeft;
    const top = dialog.offsetTop;
    if (this.props.q2form.moveable) {
      if (left < 0) {
        dialog.style.left = "0px";
      }
      if (top < 0) {
        dialog.style.top = "0px";
      }
      if (dialog.parentElement) {
        const { offsetHeight, offsetWidth } = dialog.parentElement
        const { offsetTop, offsetLeft } = dialog
        if (offsetLeft + dialog.offsetWidth > offsetWidth) {
          dialog.style.width = `${offsetWidth - offsetLeft}px`;
        }
        if (offsetTop + dialog.offsetHeight > offsetHeight) {
          dialog.style.height = `${offsetHeight - offsetTop}px`;
        }
      }

    }
  }

  loadDialogState = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const title = this.props.q2form.title.replace(/\[.*?\]/g, '');
    const menuBarHeight = document.querySelector('.MainMenuBar')?.clientHeight || 0;

    if (dialog.parentElement) {
      dialog.parentElement.style.inset = `${menuBarHeight}px 0 0`;
      // dialog.parentElement.style.background = "var(--workspace-bg)";
    }
    const dialogState = Cookies.get(`dialogState_${title}`);

    const { resizeable, moveable, width, height, left, top } = this.props.q2form;
    const saved = dialogState ? JSON.parse(dialogState) : {};

    if (resizeable) {
      if (!saved.height) saved.height = "30%"
      if (!saved.width) saved.width = "60%"
    }

    const finalWidth = resizeable && saved.width ? saved.width : String(width);
    let finalHeight = resizeable && saved.height ? saved.height : String(height);

    if (!resizeable && finalHeight.includes("%")) {
      finalHeight = `calc(${finalHeight} - 1px)`
      // finalHeight = `${window.innerHeight - menuBarHeight}px`
    }

    dialog.style.width = finalWidth;
    dialog.style.height = finalHeight;

    if (moveable) {
      if (saved.left) { dialog.style.left = saved.left; }
      else if (String(left)) { dialog.style.left = String(left) }
      else if (dialog.parentElement) { dialog.style.left = `${dialog.parentElement?.clientWidth / 2 - dialog.clientWidth / 2}px` }
      else dialog.style.left = "0px"
      if (saved.top) { dialog.style.top = saved.top }
      else if (String(top)) { dialog.style.top = String(top); }
      else if ( dialog.parentElement) { dialog.style.top = `${dialog.parentElement?.clientHeight / 2 - dialog.clientHeight / 2}px` }
      else dialog.style.top = "0px";
    } else {
      // dialog.style.left = left ? String(left) : `${(window.innerWidth - dialog.offsetWidth) / 2}px`;
      dialog.style.top = top != "" ? String(top) : `${(window.innerHeight - menuBarHeight - dialog.offsetHeight) / 2}px`;
    }
    this.normalizePosition();
  };

  onMoveMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { q2form, isTopDialog } = this.props;
    const { isMaximized } = this.state;

    if (!q2form.moveable || isMaximized || !isTopDialog) return;

    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const start = getPoint(e);
    const startLeft = dialog.offsetLeft;
    const startTop = dialog.offsetTop;

    const onMove = (event: MouseEvent | TouchEvent) => {
      const current = getPoint(event);
      dialog.style.left = `${startLeft + current.x - start.x}px`;
      dialog.style.top = `${startTop + current.y - start.y}px`;
    };

    const onStop = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onStop);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onStop);
      this.saveDialogState();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onStop);

    // Prevent accidental text selection / scroll
    if ('touches' in e) e.preventDefault();
  };


  forceResize = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;
    dialog.style.width = `${dialog.clientWidth + 1}px`;
    this.dialogHandleMouseUp();
    dialog.style.width = `${dialog.clientWidth - 1}px`;
  }

  fitHeights = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const panels = Array.from(
      dialog.querySelectorAll(growableHeightClasses) as unknown as HTMLCollectionOf<HTMLElement>
    );
    if (!panels.length) return;

    // Reset panel heights
    panels.forEach(pan => (pan.style.height = "50px"));

    // Wait one animation frame to ensure DOM updates & reflow are committed
    requestAnimationFrame(() => this.fitHeightsContinue(dialog, panels));
  };

  private fitHeightsContinue(dialog: HTMLElement, panels: HTMLElement[]) {
    // Force layout flush (safety)
    void dialog.offsetHeight;
    let step = 10;
    let safety = 0;
    const safetyLimit = window.innerHeight - dialog.clientTop;

    while (dialog.scrollHeight <= dialog.clientHeight && safety++ < safetyLimit) {
      let reachedLimit = false;
      for (let i = 0; i < panels.length; i++) {
        const pan = panels[i];
        const current = parseFloat(getComputedStyle(pan).height);
        pan.style.height = `${current + step}px`;
        // Reading scrollHeight forces layout
        if (dialog.scrollHeight > dialog.clientHeight) {
          // Oversized — step back
          pan.style.height = `${current}px`;
          void dialog.offsetHeight;
          if (step > 1) {
            step = Math.max(1, Math.floor(step / 2));
          } else {
            reachedLimit = true;
          }
          break;
        }
      }

      if (reachedLimit) break;

      const free = dialog.clientHeight - dialog.scrollHeight;
      if (free < 50 && step > 1) step = 1;
    }

    if (safety >= safetyLimit) {
      console.warn("Dialog.fitHeights() stopped due to safety limit");
    }
  }


  fitWidths = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const panels = Array.from(dialog.querySelectorAll(growableWidthClasses) as unknown as HTMLCollectionOf<HTMLElement>);
    if (!panels.length) return;

    const states: Array<any> = [];

    // save height state
    panels.forEach(pan => {
      states.push({
        pan,
        overflowX: pan.style.overflowX,
        height: pan.style.height,
      });

      const currentHeight = pan.offsetHeight;
      pan.style.height = `${currentHeight}px`; // фиксируем высоту, чтобы не схлопнулась
      pan.style.overflowX = "hidden"; // временно отключаем горизонтальный скролл
      pan.style.width = pan.style.minWidth || "50px";
    });

    let step = 10;

    // grow until scroll
    while (dialog.scrollWidth <= dialog.clientWidth) {
      let reachedLimit = false;

      for (let i = 0; i < panels.length; i++) {
        const pan = panels[i];
        const current = parseFloat(getComputedStyle(pan).width);
        pan.style.width = `${current + step}px`;

        if (dialog.scrollWidth > dialog.clientWidth) {
          // перебор — шаг назад
          pan.style.width = `${current}px`;

          if (step > 1) {
            step = Math.max(1, Math.floor(step / 2));
          } else {
            reachedLimit = true;
          }
          break;
        }
      }

      if (reachedLimit) break;

      const free = dialog.clientWidth - dialog.scrollWidth;
      if (free < 50 && step > 1) step = 1;
    }
    // restore height state
    states.forEach(({ pan, overflowX, height }) => {
      pan.style.overflowX = overflowX || "";
      pan.style.height = height || "";
    });
  };

  dialogHandleMouseUp = () => {
    if (!this.props.q2form.resizeable) return;
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
    this.fitHeights();
    this.fitWidths();

    // store snapshot for next invocation
    this.prevDialogSnapshotRef = snapshot;

    const hasVerticalScrollbar = dialog.scrollHeight > dialog.clientHeight;
    const hasHorizontalScrollbar = dialog.scrollWidth > dialog.clientWidth;

    if (hasVerticalScrollbar) {
      dialog.style.height = `${dialog.scrollHeight + 3}px`;
    }

    if (hasHorizontalScrollbar) {
      dialog.style.width = `${dialog.scrollWidth + 3}px`;
    }

    // update snapshot after possible size changes
    this.prevDialogSnapshotRef = {
      clientWidth: dialog.clientWidth,
      clientHeight: dialog.clientHeight,
      scrollWidth: dialog.scrollWidth,
      scrollHeight: dialog.scrollHeight,
      childCount: dialog.children.length
    };
    // console.log(this.prevDialogSnapshotRef)
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
      dialog.style.left = "0px";
      dialog.style.top = "0px";
      dialog.style.width = dialog.parentElement?.offsetWidth + "px";
      const menuBarHeight = document.querySelector('.MainMenuBar')?.clientHeight || 0;
      dialog.style.height = (window.innerHeight - menuBarHeight) + "px";
      this.setState({ isMaximized: true }, this.dialogHandleMouseUp);
    } else {
      if (this.prevStateRef) {
        dialog.style.width = this.prevStateRef.width;
        dialog.style.height = this.prevStateRef.height;
        dialog.style.left = this.prevStateRef.left;
        dialog.style.top = this.prevStateRef.top;
      }
      this.setState({ isMaximized: false }, this.dialogHandleMouseUp);
    }
  };

  render() {
    const { onClose, q2form, isTopDialog, dialogIndex } = this.props;
    const { isMaximized } = this.state;
    q2form.dialogIndex = dialogIndex;
    const frameless = q2form.frameless

    if (!q2form) return null;

    return (
      <div className={"dialog-pre-container"}
        key={q2form.key}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          inset: "0",
          position: "fixed"
        }}>
        <div
          className={`dialog-container Q2Dialog ${q2form.class} ${frameless ? "frameless" : ""}
                        ${isTopDialog ? '' : 'disabled'} ${isMaximized ? "maximized" : ""}
                        `}
          ref={this.dialogRef}
          key={q2form.key}
        >

          {!frameless && (
            <div
              className={`dialog-header ${isTopDialog ? "" : "disabled"}`}
              onMouseDown={this.onMoveMouseDown}
              onPointerDown={this.onMoveMouseDown}
            >
              <span className="dialog-title">
                <b>{q2form.title}</b>
              </span>
              <div>
                {q2form.hasMaxButton && q2form.resizeable && (
                  <button className="max-button" onClick={this.handleMaximize}>
                    {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                  </button>
                )}
                <button className="close-button" onClick={onClose}>
                  <CloseIcon />
                </button>
              </div>
            </div>
          )}

          <div className="dialog-content">
            <Q2FrontForm
              q2form={q2form}
              onClose={onClose}
              forceResize={this.forceResize}
              isTopDialog={isTopDialog} />
          </div>
        </div>
      </div>
    );
  }
}

export function MaximizeIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* outer square */}
      <rect x="4" y="6" width="16" height="16" rx="2" ry="2" />
    </svg>
  );
}

export function RestoreIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* front window, shifted */}
      <rect x="4" y="11" width="11" height="11" rx="0" ry="0" />
      {/* back window */}
      <path
        d="M8 10 V6 H20 V18 H16" rx="2" ry="2"
        fill="none"
      />
    </svg>
  );
}

export function CloseIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* front window, shifted */}
      <path
        d="M4 7 L20 22 M 4 22 L20 7" rx="2" ry="2"
        fill="none"
      />
    </svg>
  );
}

export default Dialog;
