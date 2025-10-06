import Q2Widget from './Widget';
import { Q2WidgetProps } from './Widget';
import './Button.css';

interface Q2ButtonProps extends Q2WidgetProps { }

export class Q2Button extends Q2Widget<Q2ButtonProps> {
    constructor(props: Q2ButtonProps) {
        super(props);
    }

    render() {
        const { column } = this.props;
        const disabled = column.disabled;
        return (
            <button className="Q2Button"
                onClick={column.valid}
                disabled={disabled}
            >
                {column?.label}
            </button>
        );
    }
}

export default Q2Button;
