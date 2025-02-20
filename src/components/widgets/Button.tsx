import { Component } from 'react';
import './Button.css';

// interface Q2ButtonProps {
// }

interface Q2ButtonProps {
    label: string;
    onClick: () => void;
}

class Q2Button<P extends Q2ButtonProps> extends Component<P> {    
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
