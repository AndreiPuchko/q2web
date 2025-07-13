import { Component } from 'react';
import { Q2Control } from "../../q2_modules/Q2Form";


export interface WidgetProps {
    id?: string;
    column: Q2Control;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => void;
    readOnly: boolean;
    form: any;
}

class Widget<P extends WidgetProps, S = {}> extends Component<P, S> {

    constructor(props: P) {
        super(props);
        if (!props.id) {
            props.id = `${props.column.column}-${props.column.key}`
        }
    }

    getData() {
        return this.props.column.data;
    }

    focusIn = () => {
        this.props.form.focus = this.props.column.column
        this.props.form.handleFocus()
    }

    focusOut = () => {
        this.props.form.prevFocus = this.props.column.column;
    }

    focus() {
        const { id } = this.props;
        if (id) document.getElementById(id)?.focus()
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
