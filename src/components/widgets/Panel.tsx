import React, { Component, CSSProperties } from "react";
import Q2CheckBox from './widgets/CheckBox'; // Import the CheckBox widget


interface Q2PanelProps {
    id: string;
    name: string;
    col: any;
    data: any;
    onChange: (e: any) => void;
    readOnly: boolean;
    form: any;
    valid: any;
    ref?: any;
}

class Q2Panel extends Component<Q2PanelProps> {

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { col } = this.props;
        this.props.onChange(e);
        col.checked = e.currentTarget.checked ? true : false;
    };

    render() {
        const { col, id, data, onChange, readOnly, form } = this.props;
        // Panel style logic (copied from Form.renderPanel)
        let className = col.column === "/h" ? "Panel flex-row group-box" : "Panel flex-column group-box";
        let style: CSSProperties = { display: "flex", flex: 1, padding: "0.5cap" };
        const rootStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-center', width: 'auto' };

        if (col.column === "/f") {
            className += " panel-formgrid";
            style = {
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                gap: "0.2em",
                padding: "0.5cap"
            };
        } else if (col.column === "/v") {
            style.flexDirection = 'column';
        } else {
            style.flexDirection = 'row';
        }
        style.alignItems = 'start';
        style.justifyContent = 'flex-start';
        if ([4, 5, 6].includes(col?.alignment)) {
            style.alignItems = 'center';
        }
        if (col.label === "") {
            rootStyle.border = "none";
            rootStyle.margin = "0px";
            rootStyle.padding = "0px";
        }

        const panel_id = `${col.key}-panel-id`;
        const hasCheck = col?.check;
        // const checked = data !== undefined ? data : true;
        const checked = col.checked;
        console.log(this.props.children)

        return (
            <div className={className} style={rootStyle} key={col.key}>
                {col.label && (
                    hasCheck ? (
                        // Has checkbox
                        <div className="group-box-title">
                            <input
                                id={panel_id}
                                key={panel_id}
                                type="checkbox"
                                checked={checked}
                                onChange={this.handleChange}
                            />
                            <label htmlFor={panel_id}>{col.label}</label>
                        </div>
                    ) : (
                        // Has label
                        <div className="group-box-title">{col.label}</div>
                    )
                )}
                <fieldset
                    className="field-set-style"
                    disabled={hasCheck && !checked}
                >
                    <div style={style}>
                        {/* Children panels or controls should be rendered by parent Form */}
                        {this.props.children}
                    </div>
                </fieldset>
            </div>
        );
    }
}

export default Q2Panel;
