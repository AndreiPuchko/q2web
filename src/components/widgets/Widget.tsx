import { Component } from 'react';

export interface WidgetProps {
    id: string;
    name: string;
    value: any;
    col: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly: boolean;
    form: any;
    valid: (form: any) => boolean;
}

class Widget<P extends WidgetProps, S = {}> extends Component<P, S> {
    getValue() {
        return this.props.value;
    }

    // setValue(value: any) {

    //     // this.props.onChange({ target: { name: this.props.name, value } });
    // }

    render() {
        return (<></>);
    }
}

export default Widget;
