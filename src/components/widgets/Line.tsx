import React from 'react';
import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

interface Q2LineState {
    value: string;
}

class Q2Line extends Widget<Q2LineProps, Q2LineState> {

    inputRef = React.createRef<HTMLInputElement>();

    constructor(props: Q2LineProps) {
        super(props);
        // Initialize state from col.data or props.data
        let value = (props.col && typeof props.col.data !== "undefined")
            ? props.col.data
            : (typeof props.data !== "undefined" ? props.data : "");
        // Format decimals if needed
        if (props.col?.datatype === "dec" && value !== undefined && value !== null && value !== "") {
            let num = Number(value);
            if (!isNaN(num)) {
                value = num.toFixed(props.col.datadec ?? 0);
            }
        }
        this.state = { value: value };
    }

    componentDidUpdate(prevProps: Q2LineProps) {
        // If parent updates col.data, sync state
        if (this.props.col?.data !== prevProps.col?.data && this.props.col?.data !== this.state.value) {
            let value = this.props.col.data;
            if (this.props.col?.datatype === "dec" && value !== undefined && value !== null && value !== "") {
                let num = Number(value);
                if (!isNaN(num)) {
                    value = num.toFixed(this.props.col.datadec ?? 0);
                }
            }
            this.setState({ value });
        }
    }

    setCursorPosition(pos: number) {
        if (this.inputRef.current) {
            this.inputRef.current.setSelectionRange(pos, pos);
        }
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => {
        const { col, onChange } = this.props;
        let value = (e as any).target.value;
        // ...existing code for value filtering and range enforcement...
        if (col?.datatype === "dec" || col?.datatype === "num") {
            value = value.replace(/[^0-9.-]/g, '');
            value = value.replace(',', '.');
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            if (col.datadec !== undefined && col.datadec >= 0 && value.includes('.')) {
                const [intPart, decPart] = value.split('.');
                value = intPart + '.' + decPart.slice(0, col.datadec);
            }
        }
        else if (col?.datatype === "int") {
            value = value.replace(/[^0-9-]/g, '');
        }
        if (["int", "num", "dec"].includes(col?.datatype) && typeof col.range === "string" && value !== "") {
            let numValue = Number(value);
            if (!isNaN(numValue)) {
                const rangeParts = col.range.trim().split(/\s+/);
                if (rangeParts.length === 1) {
                    if (col.range.trim() === "0") {
                        if (numValue < 0) numValue = Math.abs(numValue);
                    } else {
                        const upper = Number(rangeParts[0]);
                        if (!isNaN(upper) && numValue > upper) numValue = upper;
                    }
                } else if (rangeParts.length === 2) {
                    const lower = rangeParts[0] === "" ? undefined : Number(rangeParts[0]);
                    const upper = rangeParts[1] === "" ? undefined : Number(rangeParts[1]);
                    if (lower !== undefined && !isNaN(lower) && numValue < lower) numValue = lower;
                    if (upper !== undefined && !isNaN(upper) && numValue > upper) numValue = upper;
                }
                value = (col.datatype === "dec" && col.datadec !== undefined)
                    ? numValue.toFixed(col.datadec)
                    : numValue.toString();
            }
        }
        col.data = value;
        this.setState({ value }, () => {
            if (onChange) {
                onChange({
                    target: {
                        value: value,
                        name: (e as any).target.name
                    }
                } as any);
            }
        });
    };

    handleSpin = (delta: number) => {
        const { col } = this.props;
        let value = this.state.value ?? col.data ?? "";
        let cursorPos = this.inputRef.current?.selectionStart ?? value.length;

        let num = Number(value);
        if (isNaN(num)) num = 0;

        let newValue: string;
        if (col?.datatype === "dec") {
            const dotPos = value.indexOf(".");
            let step = 1;
            if (dotPos !== -1) {
                if (cursorPos <= dotPos) {
                    const digitIdx = dotPos - cursorPos - 1;
                    step = Math.pow(10, digitIdx + 1);
                } else {
                    const decIdx = cursorPos - dotPos - 1;
                    step = Math.pow(10, -(decIdx + 1));
                }
            }
            num = parseFloat((num + delta * step).toFixed(col.datadec ?? 0));
            newValue = num.toFixed(col.datadec ?? 0);
        } else if (col?.datatype === "int" || col?.datatype === "num") {
            let step = 1;
            if (value.length > 0) {
                const digitIdx = value.length - cursorPos - 1;
                step = Math.pow(10, Math.max(0, digitIdx + 1));
            }
            num = num + delta * step;
            newValue = num.toString();
        } else {
            newValue = value;
        }

        // Update state and restore cursor position after render
        this.setState({ value: newValue }, () => {
            this.handleChange({
                target: {
                    value: newValue,
                    name: this.inputRef.current ? this.inputRef.current.name : col.column
                }
            });
            setTimeout(() => {
                if (this.inputRef.current) {
                    this.inputRef.current.focus();
                    this.inputRef.current.setSelectionRange(cursorPos, cursorPos);
                }
            }, 0);
        });
    };

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { col } = this.props;
        if ((col?.datatype === "dec" || col?.datatype === "num")) {
            const input = e.currentTarget;
            const value = input.value;
            const cursorPos = input.selectionStart ?? 0;
            const dotPos = value.indexOf(".");
            // "." key: toggle cursor before/after decimal
            if ((e.key === "." || e.key === ",") && dotPos !== -1) {
                e.preventDefault();
                this.setCursorPosition(cursorPos > dotPos ? dotPos : dotPos + 1);
            }
            // If "-" pressed, toggle minus sign at start
            else if (e.key === "-") {
                e.preventDefault();
                let newValue = value;
                if (value.startsWith("-")) {
                    newValue = value.slice(1);
                } else {
                    newValue = "-" + value;
                }
                setTimeout(() => {
                    const newCursor = value.startsWith("-") ? Math.max(cursorPos - 1, 0) : cursorPos + 1;
                    this.setState({ value: newValue }, () => {
                        this.setCursorPosition(newCursor);
                        this.handleChange({
                            target: {
                                value: newValue,
                                name: input.name
                            }
                        });
                    });
                }, 0);
            }
            else if (e.key === "Backspace") {
                if (input.selectionStart === 0 && input.selectionEnd === value.length) {
                    e.preventDefault();
                    this.clearInput("0", dotPos, col, input);
                }
                else if (dotPos === 1 && value.length > 1 && input.selectionStart === 1 && input.selectionEnd === 1) {
                    e.preventDefault();
                    const newValue = "0" + value.slice(dotPos);
                    setTimeout(() => {
                        this.setState({ value: newValue }, () => {
                            this.setCursorPosition(1);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        });
                    }, 0);
                }
                else if (cursorPos - dotPos === 1) {
                    e.preventDefault();
                    this.setCursorPosition(dotPos);
                }
                else if (dotPos !== -1 && cursorPos > dotPos) {
                    e.preventDefault();
                    const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos) + "0";
                    setTimeout(() => {
                        this.setState({ value: newValue }, () => {
                            this.setCursorPosition(cursorPos - 1);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        });
                    }, 0);
                }
            }
            else if (e.key === "Delete") {
                if (input.selectionStart === 0 && input.selectionEnd === value.length) {
                    e.preventDefault();
                    this.clearInput("0", dotPos, col, input);
                }
                else if (dotPos === 1 && value.length > 1 && input.selectionStart === 0 && input.selectionEnd === 0) {
                    e.preventDefault();
                    const newValue = "0" + value.slice(dotPos);
                    setTimeout(() => {
                        this.setState({ value: newValue }, () => {
                            this.setCursorPosition(1);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        });
                    }, 0);
                }
                else if (dotPos !== -1 && cursorPos > dotPos) {
                    e.preventDefault();
                    const newValue = value.slice(0, cursorPos) + value.slice(cursorPos + 1) + "0";
                    setTimeout(() => {
                        this.setState({ value: newValue }, () => {
                            this.setCursorPosition(cursorPos);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        });
                    }, 0);
                }
                else if (cursorPos - dotPos === 0) {
                    e.preventDefault();
                    this.setCursorPosition(dotPos + 1);
                }
            }
            else if (e.key == "End" && dotPos !== -1) {
                e.preventDefault();
                this.setCursorPosition(value.length - 1);
            }
            else if (value[0] === "-" && (e.key == "Home" || (e.key == "ArrowLeft" && cursorPos === 1))) {
                e.preventDefault();
                this.setCursorPosition(1);
            }
            else if (e.key.length === 1 && e.key >= "0" && e.key <= "9") {
                if (dotPos !== -1 && cursorPos > dotPos) {
                    const intendedPos = cursorPos + 1;
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            if (this.inputRef.current.selectionStart !== intendedPos) {
                                this.setCursorPosition(intendedPos);
                            }
                        }
                    }, 0);
                }
                else if (value[0] === "0" && cursorPos === 1) {
                    setTimeout(() => {
                        this.setCursorPosition(cursorPos);
                    }, 0);
                }
                else if (input.selectionStart === 0 && input.selectionEnd === value.length) {
                    e.preventDefault();
                    this.clearInput(e.key, dotPos, col, input);
                }
            }
        }
        setTimeout(() => {
            this.handleChange({
                target: {
                    value: this.inputRef.current ? this.inputRef.current.value : this.state.value,
                    name: this.inputRef.current ? this.inputRef.current.name : undefined
                }
            });
        }, 0);
    };

    private clearInput(echar: string, dotPos: number, col: any, input: EventTarget & HTMLInputElement) {
        let newValue = echar;
        let newDotPos = -1;
        if (dotPos !== -1) {
            const zeros = col?.datadec ? "0".repeat(col.datadec) : "";
            newValue = echar + "." + zeros;
            newDotPos = newValue.indexOf(".");
        }
        setTimeout(() => {
            this.setState({ value: newValue }, () => {
                let newCursorPos = newDotPos !== -1 ? newDotPos : newValue.length;
                this.setCursorPosition(newCursorPos);
                this.handleChange({
                    target: {
                        value: newValue,
                        name: (input as any).name
                    }
                });
            });
        }, 0);
    }

    getData() {
        return this.state.value;
    }

    render() {
        const { col, readOnly, id, name } = this.props;
        const style: React.CSSProperties = {
            width: '100%',
        };

        if (col?.datalen) {
            style.maxWidth = `${col.datalen}cap`
        }

        if (col?.stretch) {
            style.flex = `${col?.stretch} 1 auto`
        }

        if (["dec", "int", "num"].includes(col?.datatype)) {
            style.textAlign = "right";
        }

        const value = this.state.value;

        const showSpin = ["dec", "int", "num"].includes(col?.datatype);
        const spinStyle = { padding: 0, width: "2cap", height: "1.5cap", fontSize: "1cap", lineHeight: 1, userSelect: "none", border: 0 };

        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <input
                    type="text"
                    className="Q2Line"
                    style={style}
                    value={value}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    onBlur={this.focusOut}
                    onFocus={this.focusIn}
                    readOnly={readOnly}
                    id={id}
                    name={name}
                    inputMode={col?.datatype === "dec" ? "decimal" : (col?.datatype === "int" || col?.datatype === "num" ? "numeric" : undefined)}
                    pattern={col?.datatype === "dec" ? "[0-9]*[.,]?[0-9]*" : (col?.datatype === "int" || col?.datatype === "num" ? "[0-9]*" : undefined)}
                    autoComplete="off"
                    ref={this.inputRef}
                />
                {showSpin && !readOnly && (
                    <span style={{ display: "flex", flexDirection: "column", marginLeft: 2 }}>
                        <button
                            type="button"
                            tabIndex={-1}
                            style={spinStyle}
                            onClick={() => this.handleSpin(1)}
                        >▲</button>
                        <button
                            type="button"
                            tabIndex={-1}
                            style={spinStyle}
                            onClick={() => this.handleSpin(-1)}
                        >▼</button>
                    </span>
                )}
            </div>
        );
    }
}

export default Q2Line;
