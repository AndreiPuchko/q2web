import React from 'react';
import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

class Q2Line extends Widget<Q2LineProps> {

    inputRef = React.createRef<HTMLInputElement>();

    setCursorPosition(pos: number) {
        if (this.inputRef.current) {
            this.inputRef.current.setSelectionRange(pos, pos);
        }
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => {
        const { col, onChange } = this.props;
        let value = e.target.value;
        if (col?.datatype === "dec" || col?.datatype === "num") {
            // Allow only numbers and decimal separator, and limit decimal places
            value = value.replace(/[^0-9.-]/g, '');
            value = value.replace(',', '.');
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Limit decimal places
            if (col.datadec !== undefined && col.datadec >= 0 && value.includes('.')) {
                const [intPart, decPart] = value.split('.');
                value = intPart + '.' + decPart.slice(0, col.datadec);
            }
        }
        else if (col?.datatype === "int") {
            // Only allow integer numbers (and minus sign)
            value = value.replace(/[^0-9-]/g, '');
        }
        

        // --- Range enforcement for int, num, dec ---
        if (["int", "num", "dec"].includes(col?.datatype) && typeof col.range === "string" && value !== "") {
            let numValue = Number(value);
            if (!isNaN(numValue)) {
                const rangeParts = col.range.trim().split(/\s+/);
                if (rangeParts.length === 1) {
                    if (col.range.trim() === "0") {
                        // Only allow >= 0
                        if (numValue < 0) numValue = Math.abs(numValue);
                    } else {
                        // Only upper bound
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
        // --- end range enforcement ---

        col.data = value
        e.target.value = value;
        if (onChange) {
            // If e is a React.ChangeEvent, just call onChange(e)
            // If e is a synthetic event from handleKeyDown, create a synthetic event
            if ('persist' in e) {
                onChange(e as React.ChangeEvent<HTMLInputElement>);
            } else {
                // Create a synthetic event for onChange
                onChange({
                    target: {
                        value: value,
                        name: e.target.name
                    }
                } as any);
            }
        }
    };

    handleSpin = (delta: number) => {
        const { col, onChange } = this.props;
        let value = col.data;
        let num = Number(value);
        if (isNaN(num)) num = 0;
        if (col?.datatype === "dec") {
            num = parseFloat((num + delta * (1 / Math.pow(10, col.datadec ?? 0))).toFixed(col.datadec ?? 0));
        } else {
            num = num + delta;
        }
        // Call onChange with a synthetic event
        const event = {
            target: {
                value: num.toString(),
                name: col.column
            }
        } as any;
        // Update col.data to keep in sync
        col.data = num.toString();
        onChange && onChange(event);
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
                    if (this.inputRef.current) {
                        this.inputRef.current.value = newValue;
                        const newCursor = value.startsWith("-") ? Math.max(cursorPos - 1, 0) : cursorPos + 1;
                        this.setCursorPosition(newCursor);
                        // Call handleChange with a synthetic event
                        this.handleChange({
                            target: {
                                value: newValue,
                                name: input.name
                            }
                        });
                    }
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
                        if (this.inputRef.current) {
                            this.inputRef.current.value = newValue;
                            this.setCursorPosition(1);
                            // Call handleChange with a synthetic event
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        }
                    }, 0);
                }
                else if (cursorPos - dotPos === 1) {
                    e.preventDefault();
                    this.setCursorPosition(dotPos);
                }
                // cursor is right of the DOT
                else if (dotPos !== -1 && cursorPos > dotPos) {
                    e.preventDefault();
                    const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos) + "0";
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            this.inputRef.current.value = newValue;
                            this.setCursorPosition(cursorPos - 1);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        }
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
                        if (this.inputRef.current) {
                            this.inputRef.current.value = newValue;
                            this.setCursorPosition(1);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        }
                    }, 0);
                }
                // cursor is right of the DOT
                else if (dotPos !== -1 && cursorPos > dotPos) {
                    e.preventDefault();
                    const newValue = value.slice(0, cursorPos) + value.slice(cursorPos + 1) + "0";
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            this.inputRef.current.value = newValue;
                            this.setCursorPosition(cursorPos);
                            this.handleChange({
                                target: {
                                    value: newValue,
                                    name: input.name
                                }
                            });
                        }
                    }, 0);
                }
                else if (cursorPos - dotPos === 0) {
                    e.preventDefault();
                    if (this.inputRef.current) {
                        this.setCursorPosition(dotPos + 1);
                    }
                }
            }
            else if (e.key == "End" && dotPos !== -1) {
                e.preventDefault();
                if (this.inputRef.current) {
                    // this.inputRef.current.setSelectionRange(value.length - 1, value.length - 1);
                    this.setCursorPosition(value.length - 1);
                }
            }
            // do not allow to set cursor left of -
            else if (value[0] === "-" && (e.key == "Home" || (e.key == "ArrowLeft" && cursorPos === 1))) {
                e.preventDefault();
                this.setCursorPosition(1);
            }
            // digit pressed
            else if (e.key.length === 1 && e.key >= "0" && e.key <= "9") {
                // If number key pressed in decimal part, move cursor one step right (not to end)
                if (dotPos !== -1 && cursorPos > dotPos) {
                    // Save intended position before change
                    const intendedPos = cursorPos + 1;
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            // Only move if cursor is at end (default browser behavior)
                            if (this.inputRef.current.selectionStart !== intendedPos) {
                                this.setCursorPosition(intendedPos);
                            }
                        }
                    }, 0);
                }
                // if cursor between 0.
                else if (value[0] === "0" && cursorPos === 1) {
                    setTimeout(() => {
                        this.setCursorPosition(cursorPos);
                    }, 0);
                }
                // If all content is selected, clear and insert number before dot
                else if (input.selectionStart === 0 && input.selectionEnd === value.length) {
                    e.preventDefault();
                    this.clearInput(e.key, dotPos, col, input);
                }
            }
        }
        // At the end, always call handleChange to ensure col.data stays in sync
        setTimeout(() => {
            if (this.inputRef.current) {
                this.handleChange({
                    target: {
                        value: this.inputRef.current.value,
                        name: this.inputRef.current.name
                    }
                });
            }
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
            if (this.inputRef.current) {
                this.inputRef.current.value = newValue;
                let newCursorPos = newDotPos !== -1 ? newDotPos : newValue.length;
                this.setCursorPosition(newCursorPos);
                // Call handleChange with a synthetic event
                this.handleChange({
                    target: {
                        value: newValue,
                        name: input.name
                    }
                });
            }
        }, 0);
    }

    getData() {
        // Defensive: avoid crash if col or col.data is undefined
        // return this.props.col && typeof this.props.col.data !== "undefined" ? this.props.col.data : "";
        if (this.inputRef.current){
            return this.inputRef.current?.value
        }
    }

    render() {
        const { col, onChange, readOnly, id, name } = this.props;
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

        // Format value for decimal fields to show .00 if needed
        let value = col.data;
        if (col?.datatype === "dec" && value !== undefined && value !== null && value !== "") {
            let num = Number(value);
            if (!isNaN(num)) {
                value = num.toFixed(col.datadec ?? 0);
            }
        }

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
