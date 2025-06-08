import React from 'react';
import Widget from './Widget';
import './RadioButton.css'; // Import the CSS file

import {WidgetProps} from './Widget';

interface Q2RadioButtonProps extends WidgetProps {}

interface Q2RadioButtonState {
    selectedValue: string;
}

class Q2RadioButton extends Widget<Q2RadioButtonProps, Q2RadioButtonState> {
    // state: any;
    // props: any;
    constructor(props: Q2RadioButtonProps) {
        super(props);
        // this.props = props;
        this.state = {
            selectedValue: props.col.data || ''
        };
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        const prevValue = this.state.selectedValue;
        this.setState({ selectedValue: newValue }, () => {
            let validResult = true;
            if (typeof this.props.col.valid === "function") {
                validResult = this.props.col.valid(newValue, this.props.col);
            }
            if (validResult === false) {
                // Revert to previous value if validation fails
                this.setState({ selectedValue: prevValue });
                this.props.col.data = prevValue;
            } else {
                this.props.col.data = newValue;
            }
        });
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
                            onChange={this.handleChange}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        );
    }
}

export default Q2RadioButton;
