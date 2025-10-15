import Q2Widget from './Widget';
import './Text.css';
import { Q2WidgetProps } from './Widget';

interface Q2TextProps extends Q2WidgetProps { }

interface Q2TextState {
    value: string;
}

export class Q2Text extends Q2Widget<Q2TextProps, Q2TextState> {
    constructor(props: Q2TextProps) {
        super(props);
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => {
        const { column } = this.props;
        const value = (e as any).target.value;
        column.data = value;
        this.setState({ value }, () => { this.changed(value) });
    };
    
    render() {
        const { column } = this.props;
        const readOnly = !!column.readonly;
        const style: React.CSSProperties = {
            width: '98%',
        };

        return (
            <textarea
                key={column.key}
                className="Q2Text"
                value={column.data}
                readOnly={readOnly}
                onChange={this.handleChange}
                style={style}
                id={this.id}
                name={column.column}
            />
        );
    }
}

export default Q2Text;
