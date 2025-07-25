import React from 'react';
import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

interface Q2LineState {
    value: string;
}

class Q2Line extends Widget<Q2LineProps, Q2LineState> {

    inputRef = React.createRef<HTMLInputElement>();

    // Fix: define state as a class property to avoid setState before mount
    state: Q2LineState = {
        value: ""
    };

    constructor(props: Q2LineProps) {
        super(props);
        // Initialize state from col.data or props.data
        let value = (props.column && typeof props.column.data !== "undefined")
            ? props.column.data
            : (typeof props.column.data !== "undefined" ? props.column.data : "");
        // Format decimals if needed (dec and num are treated the same)
        if ((props.column?.datatype === "dec" || props.column?.datatype === "num") && value !== undefined && value !== null && value !== "") {
            let num = Number(value);
            if (!isNaN(num)) {
                value = num.toFixed(props.column.datadec ?? 0);
            }
        }
        // Assign initial state directly
        this.state = { value: value };
        // Do NOT call setState or handleChange here to avoid setState before mount
    }

    componentDidMount() {
        // Call handleChange here to ensure correct formatting for int/num/dec on first render
        this.handleChange({
            target: {
                value: this.state.value,
                name: this.props.column.column
            }
        });
    }

    componentDidUpdate(prevProps: Q2LineProps) {
        // If parent updates col.data, sync state
        if (this.props.column?.data !== prevProps.column?.data && this.props.column?.data !== this.state.value) {
            let value = this.props.column.data;
            if ((this.props.column?.datatype === "dec" || this.props.column?.datatype === "num") && value !== undefined && value !== null && value !== "") {
                const num = Number(value);
                if (!isNaN(num)) {
                    value = num.toFixed(this.props.column.datadec ?? 0);
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
        const { column, form } = this.props;
        let value = (e as any).target.value;
        // dec and num are treated the same
        if (column?.datatype === "dec" || column?.datatype === "num") {
            value = value.replace(/[^0-9.-]/g, '');
            value = value.replace(',', '.');
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            if (column.datadec !== undefined && column.datadec >= 0 && value.includes('.')) {
                const [intPart, decPart] = value.split('.');
                value = intPart + '.' + decPart.slice(0, column.datadec);
            }
        }
        else if (column?.datatype === "int") {
            value = value.replace(/[^0-9-]/g, '');
            if (value === "") value = "0";
        }
        // Range enforcement for int, num, dec
        if (["int", "num", "dec"].includes(column?.datatype) && typeof column.range === "string" && value !== "") {
            let numValue = Number(value);
            if (!isNaN(numValue)) {
                const rangeParts = column.range.trim().split(/\s+/);
                if (rangeParts.length === 1) {
                    if (column.range.trim() === "0") {
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
                value = ((column.datatype === "dec" || column.datatype === "num") && column.datadec !== undefined)
                    ? numValue.toFixed(column.datadec)
                    : numValue.toString();
            }
        }
        column.data = value;
        this.setState({ value }, () => { this.changed(value) });
    };

    handleSpin = (delta: number) => {
        const { column } = this.props;
        const value = this.inputRef.current?.value;
        if (value === undefined) return
        let cursorPos = this.inputRef.current?.selectionStart ?? value.length;
        const prevLength = value.length;

        let num = Number(value);
        if (isNaN(num)) num = 0;
        let newValue: string;
        if (column?.datatype === "dec" || column?.datatype === "num") {
            const dotPos = value.indexOf(".");
            let step = 1;
            if (dotPos !== -1) {
                if (cursorPos === 0 || cursorPos === value.length) cursorPos = dotPos;
                if (cursorPos <= dotPos) {
                    const digitIdx = dotPos - cursorPos - 1;
                    step = Math.pow(10, digitIdx + 1);
                } else {
                    let decIdx: number = cursorPos - dotPos - 1;
                    if (decIdx >= column.datadec) decIdx = column.datadec - 1;
                    step = Math.pow(10, -(decIdx + 1));
                }
            }
            // num = parseFloat((num + delta * step).toFixed(col.datadec ?? 0));
            // newValue = num.toFixed(col.datadec ?? 0);
            newValue = (num + delta * step).toFixed(column.datadec ?? 0);
        } else if (column?.datatype === "int") {
            if (cursorPos === 0) cursorPos = value.length;
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
        cursorPos = cursorPos + (newValue.length - prevLength)
        // Update state and restore cursor position after render
        this.setState({ value: newValue }, () => {
            this.handleChange({
                target: {
                    value: newValue,
                    name: this.inputRef.current ? this.inputRef.current.name : column.column
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
        const { column } = this.props;
        if (column?.datatype === "int" || column?.datatype === "dec" || column?.datatype === "num") {
            if (e.key == "ArrowUp") {
                e.preventDefault();
                this.handleSpin(1);
                return;
            }
            else if (e.key == "ArrowDown") {
                e.preventDefault();
                this.handleSpin(-1);
                return;
            }
        }
        if ((column?.datatype === "dec" || column?.datatype === "num")) {
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
                    this.clearInput("0", dotPos, column, input);
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
                    this.clearInput("0", dotPos, column, input);
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
                    this.clearInput(e.key, dotPos, column, input);
                }
            }
        }
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
        const { column } = this.props;
        const style: React.CSSProperties = {
            width: '100%',
        };
        const readOnly = !!column.readonly;
        if (column?.datalen) {
            style.maxWidth = `${column.datalen}cap`
        }

        if (column?.stretch) {
            style.flex = `${column?.stretch} 1 auto`
        }

        if (["dec", "int", "num"].includes(column?.datatype)) {
            style.textAlign = "right";
        }

        const value = this.state.value;

        const showSpin = (column?.datatype === "dec" || column?.datatype === "num" || column?.datatype === "int");
        const spinStyle = { padding: 0, width: "2cap", height: "1.5cap", fontSize: "1cap", lineHeight: 1, UserSelect: "none", border: 0 };

        // Add onWheel handler for spin
        const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
            if (!showSpin || readOnly) return;
            if (this.inputRef.current !== document.activeElement) return;
            if (e.deltaY < 0) {
                this.handleSpin(1);
            } else if (e.deltaY > 0) {
                this.handleSpin(-1);
            }
        };

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
                    id={this.id}
                    name={column.column}
                    inputMode={(column?.datatype === "dec" || column?.datatype === "num") ? "decimal" : (column?.datatype === "int" ? "numeric" : undefined)}
                    pattern={(column?.datatype === "dec" || column?.datatype === "num") ? "[0-9]*[.,]?[0-9]*" : (column?.datatype === "int" ? "[0-9]*" : undefined)}
                    autoComplete="off"
                    ref={this.inputRef}
                    onWheel={handleWheel}
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
