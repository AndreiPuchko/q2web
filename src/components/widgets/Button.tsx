import { Component } from 'react';
import './Button.css';

interface Q2ButtonProps {
    label: string;
    onClick: () => void;
}

class Q2Button extends Component<Q2ButtonProps> {
    render() {
        return (
            <button onClick={this.props.onClick} className="Q2Button">
                {this.props.label}
            </button>
        );
    }
}

export default Q2Button;
