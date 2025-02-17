import React from 'react';
import Widget from './Widget';

class Text extends Widget {
    constructor(props) {
        super(props);
    }

    render() {
        const style = {
            width: '100%', // Allow the textarea to grow in width
            height: '100%', // Allow the textarea to grow in height
            resize: 'none' // Remove the resize indicator
        };
        return <textarea className="Q2Text" style={style} />;
    }
}

export default Text;
