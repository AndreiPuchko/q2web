import React, { Component, CSSProperties } from "react";
import { focusFirstFocusableElement } from '../../utils/dom';
import Q2RadioButton from "./RadioButton";
import { Q2Control, Q2Form } from "../../q2_modules/Q2Form"

interface Q2PanelProps {
    panel: any;
    onChange: (e: any) => void;
    form: any;
    formData: any;
    setState: any;
}

class Q2Panel extends Component<Q2PanelProps, { checkChecked: boolean }> {
    hasCheck: boolean;
    constructor(props: Q2PanelProps) {
        super(props);
        const { panel } = this.props;
        this.hasCheck = panel.column?.check;
        // Use panel.column.checkChecked for initial state
        this.state = {
            checkChecked: panel.column.checkChecked
        };
    }

    static getDerivedStateFromProps(nextProps: Q2PanelProps, prevState: { checkChecked: boolean }) {
        // Sync state with panel.column.checkChecked if it changes from parent (e.g. on section switch)
        if (nextProps.panel.column.checkChecked !== prevState.checkChecked) {
            return { checkChecked: nextProps.panel.column.checkChecked };
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

    componentDidUpdate(): void {
        this.componentDidMount();
    }


    checkStatusChanged(checkStatus?: any) {
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
        const { panel } = this.props;
        const checked = e.currentTarget.checked ? true : false;
        this.checkStatusChanged(checked)
        this.setState({ checkChecked: checked }, () => {
            this.props.onChange(e);
            panel.column.checkChecked = checked;
            if (checked && this.panelRef) {
                const fieldset = this.panelRef.querySelector('fieldset.field-set-style');
                if (fieldset instanceof HTMLElement) {
                    setTimeout(() => {
                        focusFirstFocusableElement(fieldset);
                    }, 100);
                }
            }
        });
    };

    panelRef: HTMLDivElement | null = null;

    render() {
        const { panel, form, setState } = this.props;
        // Panel style logic (copied from Form.renderPanel)
        let className = panel.column.column === "/h" ? "Panel flex-row" : "Panel flex-column";
        if (panel?.label !== "" && panel?.label !== undefined) {
            className += " group-box ";
        }
        if (panel?.label !== "-" && panel?.label !== "" && !panel?.isTabWidget && panel?.label !== undefined) {
            className += " group-box-border ";
        }
        if (panel.isTabPage) {
            className += " tab-page";
        }
        let style: CSSProperties = { display: "flex", flex: 1, padding: "0.5cap" };
        const rootStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-center', width: 'auto' };

        if (panel.column.column === "/f") {
            className += " panel-formgrid";
            style = {
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                width: "100%",
                // gap: "0.2em",
                // padding: "0.5cap"
            };
        } else if (panel.column.column === "/v" || panel.column.column === "/t") {
            style.flexDirection = 'column';
        } else {
            style.flexDirection = 'row';
        }
        style.alignItems = 'start';
        style.justifyContent = 'flex-start';

        if ([7, 8, 9].includes(panel.column?.alignment)) {
            style.alignItems = 'start';
        }
        else if ([4, 5, 6].includes(panel.column?.alignment)) {
            style.alignItems = 'center';
        }
        else if ([1, 2, 3].includes(panel.column?.alignment)) {
            style.alignItems = 'end';
        }


        if ([7, 4, 1].includes(panel.column?.alignment)) {
            style.textAlign = 'left';
        }
        else if ([8, 5, 2].includes(panel.column?.alignment)) {
            style.textAlign = 'center';
        }
        else if ([9, 6, 3].includes(panel.column?.alignment)) {
            style.textAlign = 'right';
        }


        if (panel.column.label === "") {
            rootStyle.border = "none";
            rootStyle.margin = "0px";
            rootStyle.padding = "0px";
        }

        const panel_id = `${panel.column.key}-${panel.column.tag}-panel-id`;

        // Use state.checkChecked for rendering
        // const checkChecked = this.hasCheck ? this.state.checkChecked : undefined;
        const checkChecked = this.state.checkChecked;

        const tabs: any = [];
        if (panel?.isTabWidget) {
            panel.children.reduce((a: any, b: any) => {
                a;
                tabs.push({ key: b.key, label: b.label, display: "" });
            }, tabs)
        }
        function tabWidgetValid(form: Q2Form) {
            let currentOption = form.s.tabWidget;
            if (!!!currentOption) {
                currentOption = tabs[0].label;
            }
            tabs.map((tab: any, idx: number) => {
                const el = document.getElementById(tab.key)
                if (el) {
                    if (tab.label === currentOption) {
                        el.style.display = "";
                    }
                    else {
                        tabs[idx].display = el.style.display;
                        el.style.display = "none";
                    }
                }
            })
        }
        const tabWidgetControl: Q2Control = new Q2Control("tabWidget", "", {
            pic: panel.label,
            data: 1, valid: tabWidgetValid,
            style: `# {padding: 0; margin: 0; gap: 5px; border:none; border-bottom: 1px solid; display:flex; background:transparent }
                    # input {display:none;}
                    # label {border: 1px solid gray;margin-right:5px; background: var(--form-input-bg); padding: 0 1cap;}
                    # label:hover { filter: brightness(90%)}
                    # input[type="radio"]:checked + label {  background-color: LightSkyBlue;}
                    `
        })

        const tabWidgetControlProps = {
            column: tabWidgetControl,
            form: this.props.form,
            ref: (ref: any) => { this.props.form.w[tabWidgetControl.column] = ref; }
        };

        return (
            <div
                className={className}
                style={rootStyle}
                key={panel.column.key}
                ref={ref => { this.panelRef = ref; }}
            >
                {panel.column.label && (
                    panel?.isTabPage || panel?.isTabWidget ?
                        ""  // no group box header for tab pages
                        :
                        (this.hasCheck ? ( // Group Box with checkbox
                            <div className="group-box-title">
                                <input
                                    id={panel_id}
                                    key={panel_id}
                                    type="checkbox"
                                    checked={!!checkChecked}
                                    onChange={this.handleCheckStatusChange}
                                    disabled={!!panel.column.checkDisabled}
                                />
                                <label htmlFor={panel_id}>{panel.column.label}</label>
                            </div>
                        ) :
                            (  // Just Group Box Title
                                panel.label !== "-" ?
                                    <div className="group-box-title">{panel?.isTabs ?
                                        panel.label + "!" :
                                        (panel?.isTabPage ?
                                            "!" : (panel.label === "-" ? ""
                                                : panel.column.label))}</div>
                                    : <></>
                            )
                        ))}
                {(panel?.isTabWidget) ? (<Q2RadioButton {...tabWidgetControlProps} />) : ""}
                <fieldset className="field-set-style" disabled={this.hasCheck && !checkChecked}>
                    <div style={style}>
                        {panel.children && panel.children.map((child: any, index: number) => {
                            // Ensure child.id is always defined and unique
                            const childId = child.id || `${child.column}-${child.key || index}`;
                            const id = `${childId}-control-cb`;
                            if (child.children) {
                                // render nested panel
                                return (
                                    <div key={child.key + `-form-group1-${index}`}
                                        id={child.key}
                                        // style={{ gridColumn: "1 / span 2", width: "100%" }}>
                                        style={{ width: "100%" }}>
                                        {form.renderPanel(child)}
                                    </div>
                                );
                            } else {
                                // render input
                                if (child.check) {
                                    // Ensure form.c[child.column] is initialized
                                    if (typeof form.c[child.column] === "undefined") {
                                        form.c[child.column] = typeof child.checkChecked !== "undefined" ? child.checkChecked : !!child.data;
                                    }
                                    child.checkChecked = form.c[child.column];
                                }
                                return (
                                    <React.Fragment key={child.key + `-fragment-${index}`}>
                                        {child.check ?
                                            <div key={child.key + `-checkdiv-${index}`} style={{ justifySelf: "end", marginRight: "0.5em" }}>
                                                <input
                                                    id={id}
                                                    key={id}
                                                    type="checkbox"
                                                    checked={typeof form.c[child.column] !== "undefined" ? form.c[child.column] : !!child.checkChecked}
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
                                                                if (checked && typeof form.w[child.column]?.focus === "function") {
                                                                    form.w[child.column].focus();
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
                                            : (child.label !== "" ?
                                                <label
                                                    htmlFor={id}
                                                    key={child.key + "-label"}
                                                    className="form-label"
                                                    style={{ justifySelf: "end", marginRight: "0.5em" }}
                                                >
                                                    {child.label && child.control !== "check" ? child.label + ":" : ""}
                                                </label> : <></>)
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
                                                        {form.renderInput(child)}
                                                    </fieldset>
                                                ) : (
                                                    form.renderInput(child)
                                                )}
                                            </div>
                                        }
                                    </React.Fragment>
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
