import { Component } from 'react';
import { Q2Control } from "../../q2_modules/Q2Form";


export interface WidgetProps {
    id?: string;
    column: Q2Control;
    form?: any;
}

class Widget<P extends WidgetProps, S = {}> extends Component<P, S> {
    id: string;
    constructor(props: P) {
        super(props);
        if (!props.id) {
            this.id = `${props.column.column}-${props.column.key}`;
        }
        else {
            this.id = props.id;
        }
    }

    getData() {
        return this.props.column.data;
    }

    focusIn = () => {
        if (this.props.form) {
            this.props.form.focus = this.props.column.column
            this.props.form?.handleFocus()
        }
    }

    focusOut = () => {
        if (this.props.form) this.props.form.prevFocus = this.props.column.column;
    }

    focus() {
        const { id } = this.props;
        if (id) document.getElementById(id)?.focus()
        // console.log(id)
    }

    changed(value: string) {
        const { column, form } = this.props;
        column.data = value;
        this.setState({ value }, () => {
            if (form.handleChange) {
                form.handleChange({
                    target:
                    {
                        value: value,
                        name: column.column
                    }
                } as any);
            }
        });
    }

    // setValue(value: any) {
    //     // this.props.onChange({ target: { name: this.props.name, value } });
    // }

    render() {
        return (<></>);
    }
}

export default Widget;
