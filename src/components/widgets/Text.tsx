import Widget from './Widget';
import './Text.css';

class Q2Text extends Widget {
    constructor(props) {
        super(props);
    }

    render() {
        const { value, onChange, readOnly, id, name } = this.props;
        return <textarea className="Q2Text" value={value} onChange={onChange} readOnly={readOnly} id={id} name={name} />;
    }
}

export default Q2Text;
