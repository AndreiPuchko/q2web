import { Component } from 'react';
import { WidgetProps } from './Widget';
import './Button.css';

interface Q2ButtonProps extends WidgetProps { }

class Q2Button extends Component<Q2ButtonProps> {
    constructor(props: Q2ButtonProps) {
        super(props);
    }

    render() {
        const { column } = this.props;
        return (
            // <button onClick={this.props.onClick} className="Q2Button">
            <button className="Q2Button">
                {column?.label}
            </button>
        );
    }
}

export default Q2Button;
