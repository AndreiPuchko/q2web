import Widget from './Widget';
import './Text.css';
import { WidgetProps } from './Widget';

interface Q2TextProps extends WidgetProps { }

class Q2Text extends Widget<Q2TextProps> {
    constructor(props: Q2TextProps) {
        super(props);
    }

    render() {
        const { column, readOnly, id } = this.props;
        return (
            <textarea
                key={id}
                className="Q2Text"
                value={column.data}
                readOnly={readOnly}
                id={id}
                name={column.column}
            />
        );
    }
}

export default Q2Text;
