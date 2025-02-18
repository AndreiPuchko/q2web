import React from 'react';
import Widget from './Widget';

interface Q2RadioButtonProps {
    column: string;
    label: string;
    pic: string;
    data: string;
    onChange: (value: string) => void;
}

class Q2RadioButton extends Widget {
    props: Q2RadioButtonProps;

    constructor(props: Q2RadioButtonProps) {
        super(props);
        this.props = props;
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(event.target.value);
    };

    render() {
        const { column, label, pic, data, col } = this.props;
        console.log('options', col);
        const options = col.pic.split(';');

        return (
            <div className="q2-radio-button">
                <label>{label}</label>
                {options.map((option, index) => (
                    <label key={index}>
                        <input
                            type="radio"
                            name={column}
                            value={option}
                            checked={data === option}
                            onChange={this.handleChange}
                        />
                        {option}
                    </label>
                ))}
            </div>
        );
    }
}

export default Q2RadioButton;
