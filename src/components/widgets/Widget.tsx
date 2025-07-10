import { Component } from 'react';

export interface WidgetProps {
    id: string;
    name: string;
    data?: any;
    col: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => void;
    readOnly: boolean;
    form: any;
    // valid: (form: any) => boolean;
}

class Widget<P extends WidgetProps, S = {}> extends Component<P, S> {
    getData() {
        return this.props.data;
    }

    focusIn = () => {
        this.props.form.focus = this.props.col.column
        this.props.form.handleFocus()
    }

    focusOut = () => {
        this.props.form.prevFocus = this.props.col.column;
    }

    focus() {
        const { id } = this.props;
        document.getElementById(id)?.focus()
        // console.log(id)
    }

    // setValue(value: any) {
    //     // this.props.onChange({ target: { name: this.props.name, value } });
    // }

    render() {
        return (<></>);
    }
}

export default Widget;
