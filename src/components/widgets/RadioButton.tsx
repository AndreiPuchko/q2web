import React from 'react';
import Widget from './Widget';
import './RadioButton.css'; // Import the CSS file

import { WidgetProps } from './Widget';

interface Q2RadioButtonProps extends WidgetProps { }

interface Q2RadioButtonState {
    selectedValue: string;
}

class Q2RadioButton extends Widget<Q2RadioButtonProps, Q2RadioButtonState> {
    // state: any;
    // props: any;
    prevValue: string;
    constructor(props: Q2RadioButtonProps) {
        super(props);
        // this.props = props;
        this.state = {
            selectedValue: props.col.data || ''
        };
    }

    getData() {
        return this.state.selectedValue;
    }

    setData(data: any) {
        this.props.col.data = data;
        this.props.form.s[this.props.col.column] = data;
        // console.log("setData", data)
        this.setState({ selectedValue: data });
    }

    // handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    //     const newValue = event.target.value;
    //     this.setData(newValue)
    // };

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("onChange")
        const newValue = event.target.value;
        this.prevValue = this.state.selectedValue;
        this.setData(newValue)
        if (typeof this.props.col.valid === "function") {
            const validResult = this.props.col.valid(this.props.form);
        }

    };

    render() {
        const col = this.props.col;
        const options = col.pic.split(';');
        return (
            <div className="Q2RadioButton">
                {options.map((opt: any, index: number) => (
                    <label key={index}>
                        <input
                            type="radio"
                            name={col.column}
                            value={opt}
                            checked={this.state.selectedValue === opt}
                            // onMouseDown={this.handleMouseDown}
                            onChange={this.handleChange}
                            onBlur={this.focusOut}
                            onFocus={this.focusIn}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        );
    }
}

export default Q2RadioButton;
