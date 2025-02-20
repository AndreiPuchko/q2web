import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

class Q2Line extends Widget<Q2LineProps> {
    // minHeight = maxHeight = "20px";
    // constructor(props: Q2LineProps) {
    //     super(props);
    // }
    render() {
        const { value, onChange, readOnly, id, name } = this.props;
        const style = {
            width: '100%', // Allow the input to grow in width until maxWidth exceeds
            // height: `${this.minHeight}px` // Keep the height fixed
        };

        return (
            <input
                type="text"
                className="Q2Line"
                style={style}
                value={value}
                onChange={onChange}
                // onBlur={this.handleBlur}
                readOnly={readOnly}
                id={id}
                name={name}
            />
        );
    }
}

export default Q2Line;
