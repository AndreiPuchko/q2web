import React from 'react';
import './Dialog.css';
import Cookies from 'js-cookie';
import Q2FrontForm from './Q2FrontForm';

import { Q2Form } from "../q2_modules/Q2Form";

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

const growableHeightClasses = `textarea, 
                    .Q2DataList-scrollarea, 
                    .q2-scroll, 
                    .q2-report-editor-root`;

const growableWidthClasses = `
                    .Q2DataList, 
                    .q2-scroll, 
                    .q2-report-editor-root`;


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
    this.props.q2form.check_frameless()
  }

  componentDidMount() {
    this.loadDialogState();
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    dialog.style.overflow = this.props.q2form.resizeable ? "hidden" : "none"

    this.set_resize_move_icons()

    dialog.addEventListener('mouseup', this.dialogHandleMouseUp);

    window.addEventListener('resize', this.fitHeghts);

    // ensure layout is settled: resize children and run mouse-up sizing logic
    if (!this.props.q2form.resizeable) {
      this.fitHeghts()
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

    if (!saved.height) saved.height = "30%"
    if (!saved.width) saved.width = "60%"

    const finalWidth = resizeable && saved.width ? saved.width : String(width);
    const finalHeight = resizeable && saved.height ? saved.height : String(height);

    dialog.style.width = finalWidth;
    dialog.style.height = finalHeight;

    if (moveable) {
      dialog.style.left = saved.left || String(left);
      dialog.style.top = saved.top || String(top);
    } else {
      // dialog.style.left = left ? String(left) : `${(window.innerWidth - dialog.offsetWidth) / 2}px`;
      dialog.style.top = top != "" ? String(top) : `${(window.innerHeight - menuBarHeight - dialog.offsetHeight) / 2}px`;
    }
    this.normalizePosition();
  };

  onMoveMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!this.props.q2form.moveable) return;
    if (this.state.isMaximized) return;
    if (!this.props.isTopDialog) return;

    const dialog = this.dialogRef.current;
    if (!dialog) return;

    // Determine initial positions
    const isTouch = e.type.startsWith("touch");
    const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    const startLeft = dialog.offsetLeft;
    const startTop = dialog.offsetTop;

    // Move handler
    const onMove = (event: MouseEvent | TouchEvent) => {
      const clientX = (event instanceof TouchEvent)
        ? event.touches[0].clientX
        : event.clientX;
      const clientY = (event instanceof TouchEvent)
        ? event.touches[0].clientY
        : event.clientY;

      dialog.style.left = `${startLeft + clientX - startX}px`;
      dialog.style.top = `${startTop + clientY - startY}px`;
    };

    // Stop handler
    const onStop = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onStop);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onStop);
      this.saveDialogState();
    };

    // Attach listeners
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onStop);

    // Prevent accidental text selection / scroll
    if (isTouch) e.preventDefault();
  };


  forceResize = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;
    dialog.style.width = `${dialog.clientWidth + 1}px`;
    this.dialogHandleMouseUp();
    dialog.style.width = `${dialog.clientWidth - 1}px`;
  }

  fitHeghts = () => {
    const dialog = this.dialogRef.current;
    if (!dialog) return;

    const panels = Array.from(dialog.querySelectorAll(growableHeightClasses) as unknown as HTMLCollectionOf<HTMLElement>);
    if (!panels.length) return;

    // Сбрасываем панели
    panels.forEach(pan => (pan.style.height = "50px"));

    // Быстрый старт с крупным шагом, потом уменьшаем
    let step = 10;

    while (dialog.scrollHeight <= dialog.clientHeight) {
      let reachedLimit = false;

      for (let i = 0; i < panels.length; i++) {
        const pan = panels[i];
        const current = parseFloat(getComputedStyle(pan).height);
        pan.style.height = `${current + step}px`;

        if (dialog.scrollHeight > dialog.clientHeight) {
          // oversize - step back
          pan.style.height = `${current}px`;
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
  };

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
    this.fitHeghts();
    this.fitWidths();

    // store snapshot for next invocation
    this.prevDialogSnapshotRef = snapshot;

    const hasVerticalScrollbar = dialog.scrollHeight > dialog.clientHeight;
    const hasHorizontalScrollbar = dialog.scrollWidth > dialog.clientWidth;
    const elements = Array.from(
      dialog.querySelectorAll(".Q2Text, .Q2DataList-scrollarea") as
      // dialog.querySelectorAll("[class^=Q2Text]") as
      unknown as HTMLCollectionOf<HTMLElement>)

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
    const { onClose, q2form, zIndex, isTopDialog, dialogIndex } = this.props;
    const { isMaximized } = this.state;
    q2form.dialogIndex = dialogIndex;
    const frameless = q2form.frameless

    if (!q2form) return null;

    return (
      <div className={"dialog-pre-container"}
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
          style={{ zIndex }}
        >

          {!frameless && (
            <div
              className={`dialog-header ${isTopDialog ? "" : "disabled"}`}
              onMouseDown={this.onMoveMouseDown}
              onTouchStart={this.onMoveMouseDown}
            >
              <span className="dialog-title">
                <b>{q2form.title}</b>
              </span>
              <div>
                {q2form.hasMaxButton && q2form.resizeable && (
                  <button className="max-button" onClick={this.handleMaximize}>
                    {isMaximized ? "🗗" : "🗖"}
                  </button>
                )}
                <button className="close-button" onClick={onClose}>
                  &#10006;
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


export default Dialog;
