import React from 'react';
import Q2Widget from './Widget';
import { Q2WidgetProps } from './Widget';
import './CheckBox.css'; // Import CSS for styling

interface Q2CheckBoxProps extends Q2WidgetProps { }

interface Q2CheckBoxState {
    value: boolean;
}

export class Q2CheckBox extends Q2Widget<Q2CheckBoxProps, Q2CheckBoxState> {
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
        // console.log("cb did update")
    }

    setChecked(checked: boolean) {
        const { column: col } = this.props;
        col.data = checked;
        this.setState({ value: checked });
        if (typeof this.props.form.handleChange === "function") {
            // Create a synthetic event for compatibility
            const event = {
                target: { checked },
                currentTarget: { checked }
            } as React.ChangeEvent<HTMLInputElement>;
            this.props.form.handleChange(event);
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
            this.props.form.handleChange({
                target: {
                    value: checked,
                    name: col.column
                }
            } as any);
            col.data = checked;
        });
    };

    render() {
        const { column } = this.props;
        return (
            <div className="Q2CheckBox-container">
                <input
                    type="checkbox"
                    key={this.id}
                    id={this.id}
                    className="Q2CheckBox"
                    onChange={this.handleChange}
                    checked={this.state.value}
                />
                <label htmlFor={this.id}>{column.label}</label>
            </div>
        );
    }
}

export default Q2CheckBox;
