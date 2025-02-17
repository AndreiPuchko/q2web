import React from 'react';
import Widget from './Widget';

class Text extends Widget {
    constructor(props) {
        super(props);
    }

    render() {
        const { value, onChange, readOnly, id, name } = this.props;
        const style = {
            width: '100%', // Allow the textarea to grow in width
            height: '100%', // Allow the textarea to grow in height
            resize: 'none' // Remove the resize indicator
        };

        return <textarea className="Q2Text" style={style} value={value} onChange={onChange} readOnly={readOnly} id={id} name={name} />;
    }
}

export default Text;
