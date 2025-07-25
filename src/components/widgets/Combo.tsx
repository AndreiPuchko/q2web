import React from 'react';
import Widget from './Widget';
import { WidgetProps } from './Widget';

interface Q2ComboProps extends WidgetProps { }

interface Q2ComboState {
    value: string;
    showList: boolean;
    filtered: string[];
    highlightedIndex: number;
}

class Q2Combo extends Widget<Q2ComboProps, Q2ComboState> {
    inputRef: React.RefObject<HTMLInputElement>;
    values: Array<string>;
    constructor(props: Q2ComboProps) {
        super(props);
        this.values = this.props.column.pic.split(";")
        this.state = {
            value: this.props.column.data,
            showList: false,
            filtered: this.values,
            highlightedIndex: -1,
        };
        this.inputRef = React.createRef();
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const filtered = this.values.filter((v) =>
            v.toLowerCase().includes(value.toLowerCase())
        );
        this.setState({
            value,
            filtered,
            showList: true,
            highlightedIndex: -1,
        });
        // this.props.onChange?.(value);
    };

    handleItemClick = (value: string) => {
        this.setState({ value, showList: false, highlightedIndex: -1 });
        // this.props.onChange?.(value);
    };

    handleFocus = () => {
        const { value } = this.state;
        const filtered = this.values.filter((v) =>
            v.toLowerCase().includes(value.toLowerCase())
        );
        this.setState({ showList: true, filtered });
    };

    handleBlur = () => {
        setTimeout(() => {
            this.setState({ showList: false });
        }, 100); // Delay for click to register
    };

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { highlightedIndex, filtered } = this.state;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.setState({
                highlightedIndex: (highlightedIndex + 1) % filtered.length,
                showList: true,
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.setState({
                highlightedIndex:
                    (highlightedIndex - 1 + filtered.length) % filtered.length,
                showList: true,
            });
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
                this.handleItemClick(filtered[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            this.setState({ showList: false, highlightedIndex: -1 });
        }
    };

    handleClear = () => {
        this.setState({
            value: '',
            filtered: this.values,
            showList: false,
            highlightedIndex: -1,
        });
        // this.props.onChange?.('');
        this.inputRef.current?.focus();
    };

    render() {
        const { value, showList, filtered, highlightedIndex } = this.state;

        return (
            <div className="q2-combo" style={{ position: 'relative', width: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        ref={this.inputRef}
                        value={value}
                        // onChange={this.handleInputChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        onKeyDown={this.handleKeyDown}
                        style={{ flex: 1, paddingRight: '24px' }}
                    />
                    {value && (
                        <button
                            onClick={this.handleClear}
                            style={{
                                position: 'absolute',
                                right: '4px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                lineHeight: '1',
                            }}
                            title="Clear"
                        >
                            ×
                        </button>
                    )}
                </div>
                {showList && filtered.length > 0 && (
                    <ul
                        className="combo-list"
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            top: '100%',
                            left: 0,
                            right: 0,
                            border: '1px solid #ccc',
                            backgroundColor: 'white',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            maxHeight: '150px',
                            overflowY: 'auto',
                        }}
                    >
                        {filtered.map((item, idx) => (
                            <li
                                key={idx}
                                onMouseDown={() => this.handleItemClick(item)}
                                style={{
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    backgroundColor: idx === highlightedIndex ? '#eee' : 'white',
                                }}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}

export default Q2Combo;
