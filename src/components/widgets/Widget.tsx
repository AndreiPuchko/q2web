import { Component } from 'react';
import { Q2Control } from "../../q2_modules/Q2Form";


export interface WidgetProps {
    id?: string;
    column: Q2Control;
    form: any;
}

class Widget<P extends WidgetProps, S = {}> extends Component<P, S> {
    id: string;
    constructor(props: P) {
        super(props);
        if (!props.id) {
            this.id = `${props.column.column}-${props.column.key}`;
        }
        else{
            this.id = props.id;
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
