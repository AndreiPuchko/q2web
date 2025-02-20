import Widget from './Widget';
import './Text.css';
import {WidgetProps} from './Widget';

interface Q2TextProps extends WidgetProps {}

class Q2Text extends Widget<Q2TextProps> {
    constructor(props: Q2TextProps) {
        super(props);
    }

    render() {
        const { value, readOnly, id, name } = this.props;
        return (
            <textarea
                className="Q2Text"
                value={value}
                // onChange={onChange}
                readOnly={readOnly}
                id={id}
                name={name}
            />
        );
    }
}

export default Q2Text;
