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
            value: !!props.col?.data
        };
    }

    focus() {
        const { id } = this.props;
        document.getElementById(id)?.focus()
    }

    setChecked(checked: boolean) {
        const { col } = this.props;
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
        const { col } = this.props;
        const checked = e.currentTarget.checked ? true : false;
        this.setState({ value: checked }, () => {
            // console.log("CB", checked)
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
        const { col, id } = this.props;
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
                <label htmlFor={id} className="Q2CheckBox-label">{col.label}</label>
            </div>
        );
    }
}

export default Q2CheckBox;
