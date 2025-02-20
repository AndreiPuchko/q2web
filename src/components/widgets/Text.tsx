import Widget from './Widget';
import './Text.css';

interface Q2TextProps {
    id: string;
    name: string;
    value: any;
    // onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    readOnly: boolean;
    form: any; // Добавлено
    valid: (form: any) => boolean; // Добавлено
}

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
