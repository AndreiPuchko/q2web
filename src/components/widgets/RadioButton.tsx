import React from 'react';
import Widget from './Widget';
import './RadioButton.css'; // Import the CSS file

import { WidgetProps } from './Widget';

interface Q2RadioButtonProps extends WidgetProps { }

interface Q2RadioButtonState {
    selectedValue: string;
}

class Q2RadioButton extends Widget<Q2RadioButtonProps, Q2RadioButtonState> {
    prevValue: string;
    constructor(props: Q2RadioButtonProps) {
        super(props);
        this.prevValue = "";

        if (typeof props.column.data === "number") {
            this.state = {
                selectedValue: props.column.pic.split(";")[props.column.data - 1]
            };
        }
        else {
            this.state = {
                selectedValue: props.column.data || ''
            };
        }
    }
    componentDidMount(): void {
        if (typeof this.props.column.valid === "function") {
            this.props.column.valid(this.props.form);
        }

    }

    static getDerivedStateFromProps(nextProps: Q2RadioButtonProps, prevState: Q2RadioButtonState) {
        // Only update state if the prop value is different and not already in state
        if (
            typeof nextProps.column.data === "string" &&
            nextProps.column.data !== prevState.selectedValue
        ) {
            return { selectedValue: nextProps.column.data || '' };
        }
        return null;
    }

    getData() {
        return this.state.selectedValue;
    }

    setData(data: any) {
        this.props.column.data = data;
        this.props.form.s[this.props.column.column] = data;
        // console.log("setData", data)
        this.setState({ selectedValue: data });
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { column } = this.props;
        const newValue = event.target.value;
        // Update props.col.data before setState to avoid getDerivedStateFromProps reverting state
        column.data = newValue;
        this.prevValue = this.state.selectedValue;
        this.setState({ selectedValue: newValue }, () => {
            this.props.form.handleChange({
                target: {
                    value: newValue,
                    name: column.column
                }
            } as unknown as React.ChangeEvent<HTMLInputElement>);
            if (typeof this.props.column.valid === "function") {
                this.props.column.valid(this.props.form);
            }
        });
    };

    focus() {
        const radio_id = `${this.id}-${0}`
        document.getElementById(radio_id)?.focus()
    }

    render() {
        const { column } = this.props;
        if (column.pic) {
            const options = column.pic.split(';');
            return (
                <div className="Q2RadioButton" id={this.id}>
                    <style>{column.style?.replace(/#/g, `#${this.id}`)}</style>
                    {options.map((opt: any, index: number) => {
                        const radio_id = `${this.id}-${index}`
                        return (
                            <>
                                <input
                                    type="radio"
                                    name={column.column}
                                    id={radio_id}
                                    value={opt}
                                    checked={this.state.selectedValue === opt}
                                    onChange={this.handleChange}
                                    onBlur={this.focusOut}
                                    onFocus={this.focusIn}
                                />
                                <label key={index} htmlFor={radio_id}>
                                    {opt}
                                </label>
                            </>
                        )
                    })}
                </div>
            );
        }
        else return (<></>)
    }
}

export default Q2RadioButton;
