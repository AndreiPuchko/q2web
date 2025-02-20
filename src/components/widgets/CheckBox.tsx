import React, { Component } from 'react';
import './CheckBox.css'; // Import CSS for styling
import { WidgetProps } from './Widget';

interface Q2CheckBoxProps extends WidgetProps { 
    // onChange: (checked: boolean) => void;
}
class Q2CheckBox extends Component<Q2CheckBoxProps> {
    // constructor(props: Q2CheckBoxProps) {
    //     super(props);
    // }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(e);
    };

    render() {
        const { col } = this.props;
        const id = col.column;
        return (
            <div className="Q2CheckBox-container">
                <input
                    type="checkbox"
                    id={id}
                    className="Q2CheckBox"
                    onChange={this.handleChange}
                />
                <label htmlFor={id} className="Q2CheckBox-label">{col.label}</label>
            </div>
        );
    }
}

export default Q2CheckBox;
