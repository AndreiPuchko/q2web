import Widget from './Widget';
import { WidgetProps } from './Widget';


interface Q2LineProps extends WidgetProps { }

class Q2Line extends Widget<Q2LineProps> {

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { col, onChange } = this.props;
        if (col?.datatype === "dec") {
            // Allow only numbers and decimal separator, and limit decimal places
            let value = e.target.value.replace(/[^0-9.,-]/g, '');
            value = value.replace(',', '.');
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Limit decimal places
            if (col.datadec !== undefined && col.datadec >= 0 && value.includes('.')) {
                const [intPart, decPart] = value.split('.');
                value = intPart + '.' + decPart.slice(0, col.datadec);
            }
            e.target.value = value;
        }
        if (col?.datatype === "int" || col?.datatype === "num") {
            // Only allow integer numbers (and minus sign)
            let value = e.target.value.replace(/[^0-9-]/g, '');
            e.target.value = value;
        }
        onChange && onChange(e);
    };

    handleSpin = (delta: number) => {
        const { col, onChange } = this.props;
        let value = col.data;
        let num = Number(value);
        if (isNaN(num)) num = 0;
        if (col?.datatype === "dec") {
            num = parseFloat((num + delta * (1 / Math.pow(10, col.datadec ?? 0))).toFixed(col.datadec ?? 0));
        } else {
            num = num + delta;
        }
        // Call onChange with a synthetic event
        const event = {
            target: {
                value: num.toString(),
                name: col.column
            }
        } as any;
        onChange && onChange(event);
    };

    render() {
        const { col, onChange, readOnly, id, name } = this.props;
        const style: React.CSSProperties = {
            width: '100%',
        };

        if (col?.datalen) {
            style.maxWidth = `${col.datalen}cap`
        }

        if (col?.stretch) {
            style.flex = `${col?.stretch} 1 auto`
        }

        if (["dec", "int", "num"].includes(col?.datatype)) {
            style.textAlign = "right";
        }

        // Format value for decimal fields to show .00 if needed
        let value = col.data;
        if (col?.datatype === "dec" && value !== undefined && value !== null && value !== "") {
            let num = Number(value);
            if (!isNaN(num)) {
                value = num.toFixed(col.datadec ?? 0);
            }
        }

        const showSpin = ["dec", "int", "num"].includes(col?.datatype);

        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <input
                    type="text"
                    className="Q2Line"
                    style={style}
                    value={value}
                    onChange={showSpin ? this.handleChange : onChange}
                    onBlur={this.focusOut}
                    onFocus={this.focusIn}
                    readOnly={readOnly}
                    id={id}
                    name={name}
                    inputMode={col?.datatype === "dec" ? "decimal" : (col?.datatype === "int" || col?.datatype === "num" ? "numeric" : undefined)}
                    pattern={col?.datatype === "dec" ? "[0-9]*[.,]?[0-9]*" : (col?.datatype === "int" || col?.datatype === "num" ? "[0-9]*" : undefined)}
                    autoComplete="off"
                />
                {showSpin && !readOnly && (
                    <span style={{ display: "flex", flexDirection: "column", marginLeft: 2 }}>
                        <button
                            type="button"
                            tabIndex={-1}
                            style={{ padding: 0, width: 18, height: 14, fontSize: 10, lineHeight: 1, userSelect: "none" }}
                            onClick={() => this.handleSpin(1)}
                        >▲</button>
                        <button
                            type="button"
                            tabIndex={-1}
                            style={{ padding: 0, width: 18, height: 14, fontSize: 10, lineHeight: 1, userSelect: "none" }}
                            onClick={() => this.handleSpin(-1)}
                        >▼</button>
                    </span>
                )}
            </div>
        );
    }
}

export default Q2Line;
