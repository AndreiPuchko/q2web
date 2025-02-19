import React from 'react';
import Widget from './Widget';
import './RadioButton.css'; // Import the CSS file

interface Q2RadioButtonProps {
    col: any;
    onChange: (value: string) => void;
}

interface Q2RadioButtonState {
    selectedValue: string;
}

class Q2RadioButton extends Widget<Q2RadioButtonProps, Q2RadioButtonState> {
    constructor(props: Q2RadioButtonProps) {
        super(props);
        this.state = {
            selectedValue: props.col.data || ''
        };
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        this.setState({ selectedValue: newValue }, () => {
            this.props.col.data = newValue;
        });
    };

    render() {
        const { col } = this.props;
        const options = col.pic.split(';');
        return (
            <div className="Q2RadioButton">
                {options.map((opt, index) => (
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
