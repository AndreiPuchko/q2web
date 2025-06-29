import React from 'react';
import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

class Q2Line extends Widget<Q2LineProps> {

    inputRef = React.createRef<HTMLInputElement>();

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { col, onChange } = this.props;

        if (col?.datatype === "dec" || col?.datatype === "num") {
            // Allow only numbers and decimal separator, and limit decimal places
            let value = e.target.value.replace(/[^0-9.,-]/g, '');
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
            e.target.value = value;
        }
        if (col?.datatype === "int") {
            // Only allow integer numbers (and minus sign)
            let value = e.target.value.replace(/[^0-9-]/g, '');
            e.target.value = value;
        }
        col.data = e.target.value
        // console.log(e.target.value)
        onChange && onChange(e);
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

    fireOnChangeEvent(e: React.KeyboardEvent<HTMLInputElement>, input: HTMLInputElement, newValue: string) {
        if (this.props.onChange) {
            const event = {
                ...e,
                target: {
                    ...input,
                    value: newValue,
                    name: input.name
                }
            };
            this.props.onChange(event as any);
        }
    }

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { col } = this.props;
        if ((col?.datatype === "dec" || col?.datatype === "num")) {
            const input = e.currentTarget;
            const value = input.value;
            const cursorPos = input.selectionStart ?? 0;
            const dotPos = value.indexOf(".");
            console.log(e.key, cursorPos, dotPos)
            // "." key: toggle cursor before/after decimal
            if (e.key === "." && dotPos !== -1) {
                if (cursorPos > dotPos) {
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            this.inputRef.current.setSelectionRange(dotPos, dotPos);
                        }
                    }, 0);
                    e.preventDefault();
                } else if (cursorPos <= dotPos) {
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            this.inputRef.current.setSelectionRange(dotPos + 1, dotPos + 1);
                        }
                    }, 0);
                    e.preventDefault();
                }
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
                        if (col) col.data = newValue;
                        let newCursor = cursorPos;
                        if (value.startsWith("-")) {
                            newCursor = Math.max(cursorPos - 1, 0);
                        } else {
                            newCursor = cursorPos + 1;
                        }
                        this.inputRef.current.setSelectionRange(newCursor, newCursor);
                        this.fireOnChangeEvent(e, input, newValue);
                    }
                }, 0);
            }
            // If only one digit before dot and del/backspace pressed, replace with 0 and set cursor before dot
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
                            if (col) col.data = newValue;
                            this.inputRef.current.setSelectionRange(1, 1);
                            this.fireOnChangeEvent(e, input, newValue);
                        }
                    }, 0);
                }
                else if (cursorPos - dotPos === 1) {
                    e.preventDefault();
                    this.inputRef.current.setSelectionRange(dotPos, dotPos);
                }
                else if (cursorPos > dotPos) {
                    this.inputRef.current.setSelectionRange(cursorPos - 1, cursorPos - 1);
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
                            if (col) col.data = newValue;
                            this.inputRef.current.setSelectionRange(1, 1);
                            this.fireOnChangeEvent(e, input, newValue);
                        }
                    }, 0);
                }
                else if (cursorPos - dotPos === 0) {
                    e.preventDefault();
                    this.inputRef.current.setSelectionRange(dotPos + 1, dotPos + 1);
                }
            }
            // do not allow to set cursor left of -
            else if (value[0] === "-" && (e.key == "Home" || (e.key == "ArrowLeft" && cursorPos === 1))) {
                e.preventDefault();
                if (this.inputRef.current) {
                    this.inputRef.current.setSelectionRange(1, 1);
                }
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
                                this.inputRef.current.setSelectionRange(intendedPos, intendedPos);
                            }
                        }
                    }, 0);
                }
                // if cursor between 0.
                else if (value[0] === "0" && cursorPos === 1) {
                    setTimeout(() => {
                        if (this.inputRef.current) {
                            // Only move if cursor is at end (default browser behavior)
                            this.inputRef.current.setSelectionRange(cursorPos, cursorPos);
                        }
                    }, 0);
                }
                // If all content is selected, clear and insert number before dot
                else if (input.selectionStart === 0 && input.selectionEnd === value.length) {
                    e.preventDefault();
                    this.clearInput(e.key, dotPos, col, input);
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
            if (this.inputRef.current) {
                this.inputRef.current.value = newValue;
                if (col) col.data = newValue;
                if (newDotPos !== -1) {
                    this.inputRef.current.setSelectionRange(newDotPos, newDotPos);
                } else {
                    this.inputRef.current.setSelectionRange(newValue.length, newValue.length);
                }
                this.fireOnChangeEvent(echar, input, newValue);
            }
        }, 0);
    }

    getData() {
        // Defensive: avoid crash if col or col.data is undefined
        return this.props.col && typeof this.props.col.data !== "undefined" ? this.props.col.data : "";
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
