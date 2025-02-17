import React from 'react';
import Widget from './Widget';

class Line extends Widget {
    constructor(props) {
        super(props);
        this.minHeight = this.maxHeight = 20; // Set minHeight and maxHeight to exactly one line
    }

    render() {
        const style = {
            width: '100%' // Allow the input to grow in width until maxWidth exceeds
        };

        return <input type="text" className="Q2Line" style={style} />;
    }
}

export default Line;
