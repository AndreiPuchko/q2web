import Q2Widget from './Widget';
import { Q2WidgetProps } from './Widget';

interface Q2SpacerProps extends Q2WidgetProps { }

export class Q2Spacer extends Q2Widget<Q2SpacerProps> {
    constructor(props: Q2SpacerProps) {
        super(props);
    }

    render() {
        const column = this.props.column;
        return <div className="Q2Spacer">{column.label}</div>;
    }
}

export default Q2Spacer;
