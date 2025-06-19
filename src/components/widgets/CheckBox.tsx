import React, { Component } from 'react';
import './CheckBox.css'; // Import CSS for styling
import { WidgetProps } from './Widget';

interface Q2CheckBoxProps extends WidgetProps {
    // onChange: (checked: boolean) => void;
}
class Q2CheckBox extends Component<Q2CheckBoxProps> {
    constructor(props: Q2CheckBoxProps) {
        super(props);
    }

    focus() {
        const { id } = this.props;
        document.getElementById(id)?.focus()
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { col } = this.props;
        this.props.onChange(e);
        col.data = e.currentTarget.checked ? true : false;
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
                    checked={col.data}
                />
                <label htmlFor={id} className="Q2CheckBox-label">{col.label}</label>
            </div>
        );
    }
}

export default Q2CheckBox;
