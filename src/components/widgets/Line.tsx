import React from 'react';
import Widget from './Widget';

class Q2Line extends Widget {
    constructor(props) {
        super(props);
        this.minHeight = this.maxHeight = 20; // Set minHeight and maxHeight to exactly one line
    }

    render() {
        const { value, onChange, readOnly, id, name } = this.props;
        const style = {
            width: '100%', // Allow the input to grow in width until maxWidth exceeds
            height: `${this.minHeight}px` // Keep the height fixed
        };

        return (
            <input
                type="text"
                className="Q2Line"
                style={style}
                value={value}
                onChange={onChange}
                onBlur={this.handleBlur}
                readOnly={readOnly}
                id={id}
                name={name}
            />
        );
    }
}

export default Q2Line;
