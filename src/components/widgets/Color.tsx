import React, { useEffect, useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { createPortal } from "react-dom";
import Q2Widget from './Widget';
import { Q2WidgetProps } from './Widget';



interface ColorPickerDialogProps {
    x: number;
    y: number;
    color: string;
    onChange: (c: string) => void;
    onClose: () => void;
}

interface ColorPickerDialogProps {
    x: number;
    y: number;
    color: string;
    onChange: (c: string) => void;
    onClose: () => void;
}

export function ColorPickerDialog({
    x,
    y,
    color,
    onChange,
    onClose
}: ColorPickerDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x, y });

    // Clamp position after element mounts (we need its size)
    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();

        const padding = 8;

        let newX = x;
        let newY = y;

        // Right edge
        if (rect.right > window.innerWidth - padding) {
            newX = window.innerWidth - rect.width - padding;
        }

        // Left edge
        if (newX < padding) {
            newX = padding;
        }

        // Bottom edge
        if (rect.bottom > window.innerHeight - padding) {
            newY = window.innerHeight - rect.height - padding;
        }

        // Top edge
        if (newY < padding) {
            newY = padding;
        }

        setPos({ x: newX, y: newY });
    }, [x, y]);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dialogRef.current &&
                !dialogRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const handleEyedropper = async () => {
        if ("EyeDropper" in window) {
            try {
                // @ts-ignore
                const result = await new EyeDropper().open();
                onChange(result.sRGBHex);
            } catch (err) {
                console.warn("Eyedropper canceled", err);
            }
        } else {
            alert("Your browser does not support the EyeDropper API.");
        }
    };

    return createPortal(
        <div
            ref={dialogRef}
            style={{
                position: "fixed",
                zIndex: 999999,
                left: pos.x,
                top: pos.y,
                padding: 10,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
        >
            <HexColorPicker color={color} onChange={onChange} />

            <div style={{ marginTop: 6, textAlign: "right" }}>
                <button
                    onClick={handleEyedropper}
                    style={{
                        padding: "2px 6px",
                        fontSize: 12,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        cursor: "pointer",
                        marginRight: 6
                    }}
                >
                    Pick from screen
                </button>

                <button
                    onClick={onClose}
                    style={{
                        padding: "2px 6px",
                        fontSize: 12,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        cursor: "pointer"
                    }}
                >
                    Close
                </button>
            </div>
        </div>,
        document.body
    );
}

function isValidColor(color: string): boolean {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

interface Q2ColorProps extends Q2WidgetProps { }

interface Q2ColorState {
    value: string;
    showPicker: boolean;
    dialogX: number;
    dialogY: number;
}


export class Q2Color extends Q2Widget<Q2ColorProps, Q2ColorState> {
    pickerRef = React.createRef<HTMLDivElement>();
    constructor(props: Q2ColorProps) {
        super(props);
        const value = (props.column && typeof props.column.data !== "undefined")
            ? props.column.data
            : (typeof props.column.data !== "undefined" ? props.column.data : "#FFFFFF");

        this.state = { value: value, showPicker: false };
    }


    // componentDidMount() {
    //     document.addEventListener('mousedown', this.handleClickOutside);
    // }

    // componentWillUnmount() {
    //     document.removeEventListener('mousedown', this.handleClickOutside);
    // }

    componentDidUpdate(prevProps: Q2ColorProps) {
        if (prevProps.column.data !== this.props.column.data && this.props.column.data !== this.state.value) {
            this.setState({ value: this.props.column.data });
        }
    }

    // handleClickOutside = (event: MouseEvent) => {
    //     if (this.pickerRef.current && !this.pickerRef.current.contains(event.target as Node)) {
    //         this.setState({ showPicker: false });
    //     }
    // };

    handleColorChange = (newColor: string) => {
        this.setState({ value: newColor }, () => {
            this.changed(newColor)
        });
        // this.props.onChange?.(newColor);
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputColor = e.target.value.trim();
        this.setState({ value: inputColor }, () => {
            if (isValidColor(inputColor)) {
                this.changed(inputColor)
            }
        });
    };

    handleEyedropper = async () => {
        if ('EyeDropper' in window) {
            try {
                // @ts-ignore
                const result = await new EyeDropper().open();
                this.handleColorChange(result.sRGBHex);
            } catch (err) {
                console.warn('Eyedropper canceled or failed', err);
            }
        } else {
            alert('Your browser does not support the EyeDropper API.');
        }
    };

    togglePicker = () => {
        this.setState(prev => {
            if (!prev.showPicker) {
                const rect = this.pickerRef.current?.getBoundingClientRect();
                return {
                    showPicker: true,
                    dialogX: rect ? rect.left : 0,
                    dialogY: rect ? rect.bottom + 6 : 0,
                    value: prev.value // optional, keep current value
                };
            }
            // When closing, keep dialogX/Y so TS is happy
            return {
                showPicker: false,
                dialogX: prev.dialogX,
                dialogY: prev.dialogY,
                value: prev.value
            };
        });
    };

    calculatePickerPosition = () => {
        const button = this.pickerRef.current?.querySelector('button');
        if (!button) return { top: '100%', marginTop: 6 };

        const buttonRect = button.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Need about 250px for the picker
        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
            return { bottom: '100%', marginBottom: 6 };
        }
        return { top: '100%', marginTop: 6 };
    };

    render() {
        const { value, showPicker } = this.state;
        const valid = isValidColor(value);
        const pickerPosition = this.calculatePickerPosition();


        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }} ref={this.pickerRef}>
                <button
                    style={{
                        width: 20,
                        height: 20,
                        background: valid ? value : '#fff',
                        border: '1px solid #999',
                    }}
                    title={"Open color picker"}
                    onClick={this.togglePicker}
                >
                </button>

                <input
                    value={value}
                    className="Q2Line"
                    onChange={this.handleInputChange}
                    onClick={() => this.setState({ showPicker: false })}
                    placeholder="#hex or name"
                />

                {showPicker && (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: 999999,
                            ...pickerPosition,
                            padding: 10,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    >
                        <ColorPickerDialog
                            x={this.state.dialogX}
                            y={this.state.dialogY}
                            color={valid ? value : "#ffffff"}
                            onChange={this.handleColorChange}
                            onClose={() => this.setState({ showPicker: false })}
                        />
                        <div style={{ marginTop: 6, textAlign: 'right' }}>
                            <button
                                onClick={this.handleEyedropper}
                                style={{
                                    padding: '2px 6px',
                                    fontSize: 12,
                                    border: '1px solid #ccc',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Pick from screen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
export default Q2Color;
