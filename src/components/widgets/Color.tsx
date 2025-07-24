import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import Widget from './Widget';
import { WidgetProps } from './Widget';


function isValidColor(color: string): boolean {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

interface Q2ColorProps extends WidgetProps { }

interface Q2ColorState {
    value: string;
    showPicker: boolean;
}


class Q2Color extends Widget<Q2ColorProps, Q2ColorState> {
    pickerRef = React.createRef<HTMLDivElement>();
    constructor(props: Q2ColorProps) {
        super(props);
        const value = (props.column && typeof props.column.data !== "undefined")
            ? props.column.data
            : (typeof props.column.data !== "undefined" ? props.column.data : "#FFFFFF");

        this.state = { value: value, showPicker: false };
    }


    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.value !== this.props.value && this.props.value !== this.state.color) {
            this.setState({ value: this.props.value });
        }
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.pickerRef.current && !this.pickerRef.current.contains(event.target as Node)) {
            this.setState({ showPicker: false });
        }
    };

    handleColorChange = (newColor: string) => {
        this.setState({ value: newColor });
        this.props.onChange?.(newColor);
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputColor = e.target.value.trim();
        this.setState({ value: inputColor });
        if (isValidColor(inputColor)) {
            this.props.onChange?.(inputColor);
        }
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
        this.setState((prev) => ({ showPicker: !prev.showPicker }));
    };


    render() {
        const { value, showPicker } = this.state;
        const valid = isValidColor(value);


        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} ref={this.pickerRef}>
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
                            zIndex: 999,
                            top: '100%',
                            marginTop: 6,
                            padding: 10,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    >
                        <HexColorPicker
                            color={valid ? value : '#ffffff'}
                            onChange={this.handleColorChange}
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
