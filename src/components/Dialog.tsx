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

class Dialog extends React.Component<DialogProps, DialogState> {
    dialogRef: React.RefObject<HTMLDivElement | null>;
    prevStateRef: { width: string, height: string, left: string, top: string } | null;
    resizeObserver: ResizeObserver | undefined;
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

        this.resizeObserver = new ResizeObserver(() => {
            this.resizeChildren();
        });
        this.resizeObserver.observe(dialog);

        dialog.addEventListener('mouseup', this.dialogHandleMouseUp);

        // ensure layout is settled: resize children and run mouse-up sizing logic
        if (this.props.q2form.resizeable) {
            requestAnimationFrame(() => {
                this.resizeChildren();
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
            dialog.style.borderRadius = "unset";
        }
        dialog.style.resize = this.props.q2form.resizeable && !this.state.isMaximized ? "both" : "none"
    }

    componentDidUpdate(): void {
        this.set_resize_move_icons()
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
            dialog.style.left = left ? String(left) : `${(window.innerWidth - dialog.offsetWidth) / 2}px`;
            dialog.style.top = top != "" ? String(top) : `${(window.innerHeight - menuBarHeight - dialog.offsetHeight) / 2}px`;
        }
        this.normalizePosition();
    };

    onMoveMouseDown = (e: React.MouseEvent) => {
        if (!this.props.q2form.moveable) return
        if (this.state.isMaximized) return
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
        if (!this.props.q2form.resizeable) return;
        this.normalizePosition();

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
            const pxTargets = Array.from(
                child.querySelectorAll('.DataGrid, .DataGridRoot, .q2-report-editor-root, .q2-scroll')
            ) as HTMLElement[];
            pxTargets.forEach(el => {
                el.style.height = `${height}px`;
                el.style.width = `${width}px`;
                el.style.minHeight = '0';
                el.style.minWidth = '0';
                el.style.boxSizing = 'border-box';
            });
        });
    };

    // Compute min-size recursively
    computeMinSize = (element: HTMLElement): { minW: number; minH: number } => {
        const isColumn = element.classList.contains("flex-column");

        if (element.classList.contains("Q2Text")
            || element.classList.contains("DataGrid")
            || element.classList.contains("Q2DataList-scrollarea")
        ) {
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

    forceResize = () => {
        const dialog = this.dialogRef.current;
        if (!dialog) return;
        dialog.style.width = `${dialog.clientWidth + 1}px`;
        this.dialogHandleMouseUp();
        dialog.style.width = `${dialog.clientWidth - 1}px`;
    }

    reduceHeight = () => {
        const dialog = this.dialogRef.current;
        if (!dialog) return;

        const panels = dialog.querySelectorAll("textarea, .Q2DataList-scrollarea, .q2-scroll");
        if (!panels.length) return;

        panels.forEach(pan => (pan.style.height = "50px"));

        while (dialog.scrollHeight <= dialog.clientHeight) {
            for (let i = 0; i < panels.length; i++) {
                const pan = panels[i];
                const current = parseFloat(getComputedStyle(pan).height);
                pan.style.height = `${current + 1}px`;

                // проверка после каждого изменения
                if (dialog.scrollHeight > dialog.clientHeight) {
                    // перебор — вернуть обратно и выйти
                    pan.style.height = `${current}px`;
                    return;
                }
            }
        }
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

        this.reduceHeight();
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
            dialog.style.width = window.innerWidth + "px";
            dialog.style.height = window.innerHeight + "px";
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
