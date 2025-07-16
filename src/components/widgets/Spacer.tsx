import Widget from './Widget';
import { WidgetProps } from './Widget';

interface Q2SpacerProps extends WidgetProps { }

class Q2Spacer extends Widget<Q2SpacerProps> {
    constructor(props: Q2SpacerProps) {
        super(props);
    }

    render() {
        const column = this.props.column;
        return <span className="Q2Spacer">{column.label}</span>;
    }
}

export default Q2Spacer;
