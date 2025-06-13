import Widget from './Widget';
import './Text.css';
import { WidgetProps } from './Widget';

interface Q2TextProps extends WidgetProps { }

class Q2Text extends Widget<Q2TextProps> {
    constructor(props: Q2TextProps) {
        super(props);
    }

    render() {
        const { col, readOnly, id, name } = this.props;
        return (
            <textarea
                key={col.id}
                className="Q2Text"
                value={col.data}
                readOnly={readOnly}
                id={id}
                name={name}
            />
        );
    }
}

export default Q2Text;
