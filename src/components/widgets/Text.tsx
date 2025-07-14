import Widget from './Widget';
import './Text.css';
import { WidgetProps } from './Widget';

interface Q2TextProps extends WidgetProps { }

class Q2Text extends Widget<Q2TextProps> {
    constructor(props: Q2TextProps) {
        super(props);
    }

    render() {
        const { column } = this.props;
        const readOnly = !!column.readonly;
        const style: React.CSSProperties = {
            width: '98%',
        };

        return (
            <textarea
                key={this.id}
                className="Q2Text"
                value={column.data}
                readOnly={readOnly}
                style={style}
                id={this.id}
                name={column.column}
            />
        );
    }
}

export default Q2Text;
