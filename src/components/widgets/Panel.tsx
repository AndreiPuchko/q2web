import React, { Component, CSSProperties } from "react";
import Q2CheckBox from './widgets/CheckBox'; // Import the CheckBox widget
import { focusFirstFocusableElement } from '../../utils/dom';

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
    children: any[];
    renderInput: (col: any) => React.ReactNode;
    renderPanel: (panel: any, root?: boolean) => React.ReactNode;
    formData: any;
    w: any;
    setState: any;
}

class Q2Panel extends Component<Q2PanelProps> {

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { col } = this.props;
        this.props.onChange(e);
        col.checked = e.currentTarget.checked ? true : false;
        if (col.checked) {
            // Log all input elements in the panel
            if (this.panelRef) {
                const fieldset = this.panelRef.querySelector('fieldset.field-set-style');
                setTimeout(() => {
                    focusFirstFocusableElement(fieldset);
                }, 100);
            }
        }
    };

    panelRef: HTMLDivElement | null = null;

    render() {
        const { col, id, data, onChange, readOnly, form, children, renderInput, renderPanel, formData, w, setState } = this.props;
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

        const panel_id = `${col.key}-${col.tag}-panel-id`;
        const hasCheck = col?.check;
        const checked = col.checked;
        // console.log(this.props.children)

        return (
            <div
                className={className}
                style={rootStyle}
                key={col.key}
                ref={ref => { this.panelRef = ref; }}
            >
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
                        {children && children.map((child: any, index: number) => {
                            const id = `${child.id}-control-cb`;
                            if (child.children) {
                                // render nested panel
                                return (
                                    <div key={child.key + `-form-group1-${index}`} style={{ gridColumn: "1 / span 2" }}>
                                        {renderPanel(child)}
                                    </div>
                                );
                            } else {
                                // render input fields
                                return (
                                    <>
                                        {child.check ?
                                            <div style={{ justifySelf: "end", marginRight: "0.5em" }}>
                                                <input
                                                    id={id}
                                                    key={id}
                                                    type="checkbox"
                                                    checked={!!formData?.[child.column]}
                                                    onChange={e => {
                                                        const checked = e.target.checked;
                                                        setState(
                                                            (prevState: any) => ({
                                                                formData: {
                                                                    ...prevState.formData,
                                                                    [child.column]: checked
                                                                }
                                                            }),
                                                            () => {
                                                                if (checked && typeof w[child.column]?.focus === "function") {
                                                                    w[child.column].focus();
                                                                }
                                                            }
                                                        );
                                                    }}
                                                />
                                                <label htmlFor={id}>
                                                    {child.control === "check" ? "Turn on" : child.label}
                                                </label>
                                            </div>
                                            : <label
                                                key={child.key + "-label"}
                                                className="form-label"
                                                style={{ justifySelf: "end", marginRight: "0.5em" }}
                                            >
                                                {child.label && child.control !== "check" ? child.label + ":" : ""}
                                            </label>
                                        }
                                        {child.control !== "label" &&
                                            <div key={child.key + `-form-group-${index}`}
                                                className="form-group"
                                                style={child.getStyle()}
                                            >
                                                {child.check ? (
                                                    <fieldset
                                                        className="field-set-style"
                                                        disabled={!formData?.[child.column]}
                                                    >
                                                        {renderInput(child)}
                                                    </fieldset>
                                                ) : (
                                                    renderInput(child)
                                                )}
                                            </div>
                                        }
                                    </>
                                );
                            }
                        })}
                    </div>
                </fieldset>
            </div>
        );
    }
}

export default Q2Panel;
