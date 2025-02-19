import React from 'react';
import Widget from './Widget';
import './Button.css';

interface Q2ButtonProps {
    label: string;
    onClick: () => void;
}

class Q2Button extends Widget<Q2ButtonProps> {
    render() {
        const { label, onClick } = this.props;
        return (
            <button onClick={onClick} className="q2-button">
                {label}
            </button>
        );
    }
}

export default Q2Button;
