import React, { Component } from 'react';
import './Widget.css';

interface WidgetProps {
    id: string;
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly: boolean;
    form: any;
    valid: (form: any) => boolean;
}

class Widget<P extends WidgetProps> extends Component<P> {
    getValue() {
        return this.props.value;
    }

    setValue(value: any) {
        this.props.onChange({ target: { name: this.props.name, value } });
    }

    render() {
        return null;
    }
}

export default Widget;
