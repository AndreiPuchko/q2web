import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

class Q2Line extends Widget<Q2LineProps> {
    // focus() {
    //     const { id } = this.props;
    //     document.getElementById(id)?.focus()
    // }

    render() {
        const { col, onChange, readOnly, id, name } = this.props;
        const style = {
            width: '100%',
        };

        if (col?.datalen) {
            style.maxWidth = `${col.datalen}cap`
        }

        return (
            <input
                type="text"
                className="Q2Line"
                style={style}
                value={col.data}
                onChange={onChange}
                onBlur={this.focusOut}
                onFocus={this.focusIn}
                readOnly={readOnly}
                id={id}
                name={name}
            />
        );
    }
}

export default Q2Line;
