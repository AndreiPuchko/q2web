import React, { Component } from 'react';
import './Widget.css';

interface WidgetProps {
    onChange?: (value: any) => void;
    column: any;
    value?: any;
    valid?: () => boolean;
    form?: any; // Reference to the form
}

class Widget extends Component<WidgetProps> {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    // widgetRef: any;

    constructor(props: WidgetProps) {
        super(props);
        this.minWidth = props.minWidth || 0;
        this.maxWidth = props.maxWidth || 0;
        this.minHeight = props.minHeight || 0;
        this.maxHeight = props.maxHeight || 0;
        this.widgetTag = 123;
        this.widgetRef = React.createRef();
    }

    componentDidMount(): void {
        this.widgetRef = this;
    }

    render() {
        return (
            <input
                ref={this.widgetRef}
                type="text"
                value={this.props.value}
                onChange={this.props.onChange}
                onBlur={this.handleBlur}
            />
        );
    }

    valid(form: any): boolean {
        console.log('valid!!!');
        return true;
    }

    handleBlur = (event: any) => {
        // Example usage of form.s.column_name notation
        const { form } = this.props;
        if (form) {
            const otherWidgetValue = form.s['var6'];
            // Modify the value of another widget
            form.s['other_column_name']?.setValue('New Value');
        }
    }

    getValue = () => {
        return this.props.value;
    }

    setValue = (value: any) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
}

export default Widget;
