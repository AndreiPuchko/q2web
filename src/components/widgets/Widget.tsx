import React, { Component } from 'react';
import './Widget.css';

class Widget extends Component {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;

    constructor(props) {
        super(props);
        this.minWidth = props.minWidth || 0;
        this.maxWidth = props.maxWidth || 0;
        this.minHeight = props.minHeight || 0;
        this.maxHeight = props.maxHeight || 0;
    }

    render() {
        return null; // Base widget does not render anything
    }
}

export default Widget;
