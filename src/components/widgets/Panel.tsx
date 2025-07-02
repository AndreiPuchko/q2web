import React, { Component, CSSProperties } from "react";
import Q2CheckBox from './widgets/CheckBox';
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

class Q2Panel extends Component<Q2PanelProps, { checkChecked: boolean }> {
    hasCheck: boolean;
    constructor(props: Q2PanelProps) {
        super(props);
        const { col } = this.props;
        this.hasCheck = col?.check;
        // Use col.checkChecked for initial state
        this.state = {
            checkChecked: col.checkChecked
        };
    }

    static getDerivedStateFromProps(nextProps: Q2PanelProps, prevState: { checkChecked: boolean }) {
        // Sync state with col.checkChecked if it changes from parent (e.g. on section switch)
        if (nextProps.col.checkChecked !== prevState.checkChecked) {
            return { checkChecked: nextProps.col.checkChecked };
        }
        return null;
    }

    componentDidMount() {
        // If panel has check, collect all input columns and set their check status in form.c
        if (this.hasCheck && this.panelRef) {
            // Find all input elements with a name attribute (assumed to be column name)
            const inputs = this.panelRef.querySelectorAll('input[name]');
            inputs.forEach((input: any) => {
                if (input && input.name) {
                    this.props.form.c[input.name] = !!this.state.checkChecked;
                }
            });
            // console.log("DM", this.props.form)
            // console.log("DM", this.props.form.c)
        }
    }

    componentDidUpdate(prevProps: Readonly<Q2PanelProps>, prevState: Readonly<{ checkChecked: boolean; }>, snapshot?: any): void {
        this.componentDidMount();
    }


    checkStatusChanged(checkStatus) {
        // If panel has check, update form.c for all children to match panel check status
        // console.log(this.state.checkChecked);
        if (this.hasCheck && this.panelRef) {
            const inputs = this.panelRef.querySelectorAll('input[name]');
            inputs.forEach((input: any) => {
                if (input && input.name) {
                    this.props.form.c[input.name] = !!checkStatus;
                    // this.props.form.c[input.name] = !!this.state.checkChecked;
                }
            });
        }
        this.props.form.handleChange({
            target: {
                value: "",
                name: ""
            }
        })
    }

    handleCheckStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { col } = this.props;
        const checked = e.currentTarget.checked ? true : false;
        this.checkStatusChanged(checked)
        this.setState({ checkChecked: checked }, () => {
            this.props.onChange(e);
            col.checkChecked = checked;
            if (checked && this.panelRef) {
                const fieldset = this.panelRef.querySelector('fieldset.field-set-style');
                setTimeout(() => {
                    focusFirstFocusableElement(fieldset);
                }, 100);
            }
        });
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

        // Use state.checkChecked for rendering
        // const checkChecked = this.hasCheck ? this.state.checkChecked : undefined;
        const checkChecked = this.state.checkChecked;

        return (
            <div
                className={className}
                style={rootStyle}
                key={col.key}
                ref={ref => { this.panelRef = ref; }}
            >
                {col.label && (
                    this.hasCheck ? (
                        <div className="group-box-title">
                            <input
                                id={panel_id}
                                key={panel_id}
                                type="checkbox"
                                checked={!!checkChecked}
                                onChange={this.handleCheckStatusChange}
                                disabled={!!col.checkDisabled}
                            />
                            <label htmlFor={panel_id}>{col.label}</label>
                        </div>
                    ) : (
                        <div className="group-box-title">{col.label}</div>
                    )
                )}
                <fieldset
                    className="field-set-style"
                    disabled={this.hasCheck && !checkChecked}
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
                                // render input
                                if (child.check) {
                                    child.checkChecked = typeof child.checkChecked !== "undefined" ? child.checkChecked : !!child.data;
                                }
                                return (
                                    <>
                                        {child.check ?
                                            <div style={{ justifySelf: "end", marginRight: "0.5em" }}>
                                                <input
                                                    id={id}
                                                    key={id}
                                                    type="checkbox"
                                                    checked={form.c[child.column]}
                                                    onChange={e => {
                                                        const checked = e.target.checked;
                                                        child.checkChecked = checked;
                                                        form.c[child.column] = checked;
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
                                                                this.checkStatusChanged()
                                                            }
                                                        );
                                                    }}
                                                    disabled={!!child.checkDisabled}
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
                                                        disabled={!form.c[child.column]}
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
