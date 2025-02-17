import React from 'react';
import Widget from './Widget';

class Spacer extends Widget {
    constructor(props) {
        super(props);
    }

    render() {
        const style = {
            flexGrow: 1, // Allow the spacer to take up remaining space
            height: 'auto',
            width: '100%'
        };

        return <div className="Q2Spacer" style={style}></div>;
    }
}

export default Spacer;
