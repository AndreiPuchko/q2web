import { Component } from 'react';
import { Q2Control } from "../../q2_modules/Q2Form";


export interface WidgetProps {
    id?: string;
    column: Q2Control;
    form?: any;
}

interface WidgetState {
    value: string;
}


class Widget<P extends WidgetProps, S = {}> extends Component<P, S> {
    id: string;

    state: WidgetState = {
        value: ""
    };

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

    setData = (value: String | Number) => {
        // normalize to a primitive string/number
        const normalized = value === null || value === undefined ? "" : (typeof value === "string" ? value : String(value));
        // always update the shared column data
        this.props.column.data = normalized;
        // If subclass maintains internal state.value (e.g. Q2Line), update it via setState so the input updates.
        // Otherwise fall back to forceUpdate so column-driven components (e.g. Q2Text) refresh.
        if ((this as any).state && Object.prototype.hasOwnProperty.call((this as any).state, "value") && typeof (this as any).setState === "function") {
            (this as any).setState({ value: normalized });
        } else {
            // this.forceUpdate();
        }
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

        if (form?.handleChange) {
            form.handleChange({
                target:
                {
                    value: value,
                    name: column.column
                }
            } as any);
        }

    }

    // setValue(value: any) {
    //     // this.props.onChange({ target: { name: this.props.name, value } });
    // }

    render() {
        return (<></>);
    }
}

export default Widget;
