import React, { Component } from 'react';
import './CheckBox.css'; // Import CSS for styling
import { WidgetProps } from './Widget';

interface Q2CheckBoxProps extends WidgetProps {
    // onChange: (checked: boolean) => void;
}

interface Q2CheckBoxState {
    value: boolean;
}

class Q2CheckBox extends Component<Q2CheckBoxProps, Q2CheckBoxState> {
    constructor(props: Q2CheckBoxProps) {
        super(props);
        this.state = {
            value: !!props.column?.data
        };
    }

    focus() {
        const { id } = this.props;
        if (id) document.getElementById(id)?.focus()
    }

    componentDidUpdate(prevProps: Q2CheckBoxProps) {
        // If col.data changed, update state
        if (prevProps.column?.data !== this.props.column?.data) {
            this.setState({ value: !!this.props.column?.data });
        }
    }

    setChecked(checked: boolean) {
        const { column: col } = this.props;
        col.data = checked;
        this.setState({ value: checked });
        // Optionally trigger onChange if needed
        if (typeof this.props.onChange === "function") {
            // Create a synthetic event for compatibility
            const event = {
                target: { checked },
                currentTarget: { checked }
            } as React.ChangeEvent<HTMLInputElement>;
            this.props.onChange(event);
        }
        this.forceUpdate();
    }

    getData() {
        return this.state.value;
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { column: col } = this.props;
        const checked = e.currentTarget.checked ? true : false;
        this.setState({ value: checked }, () => {
            this.props.onChange({
                target: {
                    value: checked,
                    name: col.column
                }
            } as any);
            col.data = checked;
        });
    };

    render() {
        const { column, id } = this.props;
        return (
            <div className="Q2CheckBox-container">
                <input
                    type="checkbox"
                    key={id}
                    id={id}
                    className="Q2CheckBox"
                    onChange={this.handleChange}
                    checked={this.state.value}
                />
                <label htmlFor={id} className="Q2CheckBox-label">{column.label}</label>
            </div>
        );
    }
}

export default Q2CheckBox;
