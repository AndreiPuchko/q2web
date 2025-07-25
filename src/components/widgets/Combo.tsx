import React from 'react';
import Widget from './Widget';
import { WidgetProps } from './Widget';

interface Q2ComboProps extends WidgetProps { }

interface Q2ComboState {
    value: string;
    showList: boolean;
    filtered: string[];
    highlightedIndex: number;
    dropdownAbove: boolean;
    dropdownMaxHeight: number;
}

class Q2Combo extends Widget<Q2ComboProps, Q2ComboState> {
    inputRef: React.RefObject<HTMLInputElement>;
    wrapperRef: React.RefObject<HTMLDivElement>;
    dropdownRef: React.RefObject<HTMLUListElement>;
    values: Array<string>;

    constructor(props: Q2ComboProps) {
        super(props);
        this.values = this.props.column.pic.split(';');
        this.state = {
            value: this.props.column.data,
            showList: false,
            filtered: this.values,
            highlightedIndex: -1,
        };
        this.inputRef = React.createRef();
        this.wrapperRef = React.createRef();
        this.dropdownRef = React.createRef();
        this.updateDropdownPosition();
    }

    componentDidUpdate(prevProps: Q2ComboProps) {
        if (this.props.column?.data !== prevProps.column?.data && this.props.column?.data !== this.state.value) {
            const value = this.props.column.data;
            this.setState({ value, showList: false });
        }
    }

    filterValues = (input: string) => {
        return this.values.filter((v) =>
            v.toLowerCase().includes(input.toLowerCase())
        );
    };

    updateDropdownPosition = () => {
        const wrapper = this.wrapperRef.current;
        const dropdown = this.dropdownRef.current;

        if (!wrapper || !dropdown) return;

        const rect = wrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        const maxHeight = 150;
        let dropdownAbove = false;
        let dropdownMaxHeight = maxHeight;

        if (spaceBelow < maxHeight && spaceAbove > spaceBelow) {
            dropdownAbove = true;
            dropdownMaxHeight = Math.min(spaceAbove - 10, maxHeight);
        } else {
            dropdownMaxHeight = Math.min(spaceBelow - 10, maxHeight);
        }

        const width = rect.width;
        const left = rect.left;
        const top = dropdownAbove ? undefined : rect.bottom;
        const bottom = dropdownAbove ? viewportHeight - rect.top : undefined;

        Object.assign(dropdown.style, {
            position: 'fixed', // position relative to viewport
            top: top !== undefined ? `${top}px` : 'auto',
            bottom: bottom !== undefined ? `${bottom}px` : 'auto',
            left: `${left}px`,
            width: `${width}px`,
            maxHeight: `${dropdownMaxHeight}px`,
            overflowY: 'auto',
            zIndex: 1000,
        });

        this.setState({ dropdownAbove, dropdownMaxHeight });
    };


    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const filtered = this.filterValues(value);
        this.setState({
            value,
            filtered,
            showList: true,
            highlightedIndex: -1,
        }, () => {
            this.changed(value)
        });
    };

    handleItemClick = (value: string) => {
        this.setState({
            value,
            showList: false,
            highlightedIndex: -1,
            filtered: this.filterValues(value),
        }, () => {
            this.changed(value)
        });
    };

    // handleFocus = () => {
    //     this.setState({
    //         showList: true,
    //         filtered: this.filterValues(this.state.value),
    //     }, () => this.updateDropdownPosition());
    // };

    handleBlur = () => {
        setTimeout(() => this.setState({ showList: false }), 100);
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
            } else {
                this.setState({ showList: false });
            }
        } else if (e.key === 'Escape') {
            this.setState({ showList: false, highlightedIndex: -1 });
        }
    };

    handleClear = () => {
        this.setState({
            value: '',
            filtered: this.values,
            showList: true,
            highlightedIndex: -1,
        }, () => {
            this.changed('')
            this.inputRef.current?.focus()
            this.updateDropdownPosition()
        });

    };

    toggleDropdown = () => {
        const { showList, value } = this.state;
        this.setState({
            showList: !showList,
            filtered: this.filterValues(value),
        }, () => this.updateDropdownPosition());
        this.inputRef.current?.focus();
    };

    render() {
        const { value, showList, filtered, highlightedIndex } = this.state;

        return (
            <div className="Q2Combo" ref={this.wrapperRef} style={{ display: "flex", alignItems: "center", position: 'relative' }}>
                <input
                    ref={this.inputRef}
                    value={value}
                    onChange={this.handleInputChange}
                    // onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onKeyDown={this.handleKeyDown}
                    style={{ flex: "1 auto", paddingRight: '3em', width: '100%' }}
                />
                {value && (
                    <button
                        onClick={this.handleClear}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: '1em',
                            background: 'transparent',
                            border: 'none',
                            color: "red",
                            fontSize: 'larger',
                        }}
                        title="Clear"
                    >
                        ×
                    </button>
                )}
                <button
                    onClick={this.toggleDropdown}
                    tabIndex={-1}
                    style={{
                        position: 'absolute',
                        right: '0px',
                        background: 'transparent',
                        border: 'none',
                    }}
                    title="Toggle dropdown"
                >
                    ▼
                </button>
                {showList && filtered.length > 0 && (
                    <ul
                        ref={this.dropdownRef}
                        className="combo-list"
                        style={{
                            position: 'absolute',
                            [this.state.dropdownAbove ? 'bottom' : 'top']: '100%',
                            left: 0,
                            right: 0,
                            border: '1px solid #ccc',
                            backgroundColor: 'white',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            maxHeight: `${this.state.dropdownMaxHeight}px`,
                            overflowY: 'auto',
                            boxSizing: 'border-box',
                            zIndex: 500,
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
