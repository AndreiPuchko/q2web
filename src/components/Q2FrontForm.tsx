import React, { Component } from "react";
import './Q2FrontForm.css'; // Import the CSS file for styling
import DataGrid from './DataGrid';
import Q2Line from './widgets/Line'; // Import the Line widget
import Q2Color from './widgets/Color'; // Import the Line widget
import Q2Combo from './widgets/Combo'; // Import the Line widget
import Q2Text from './widgets/Text'; // Import the Text widget
import Q2Spacer from './widgets/Spacer'; // Import the Spacer widget
import Q2CheckBox from './widgets/CheckBox'; // Import the CheckBox widget
import { focusFirstFocusableElement } from '../utils/dom';
import Q2RadioButton from "./widgets/RadioButton";
import Q2Button from './widgets/Button';
import { Q2Control, Q2Form } from "../q2_modules/Q2Form";
import Q2Panel from './widgets/Panel';
import Q2Image from './widgets/Image';

interface Q2FrontFormProps {
    q2form: Q2Form;
    onClose?: () => void;
    isTopDialog?: boolean;
}

interface Q2FrontFormState {
    formData: { [key: string]: any };
    panelChecks: { [key: string]: boolean };
    okButtonText: string;
    cancelButtonText: string;
}

export class Q2FrontForm extends Component<Q2FrontFormProps, Q2FrontFormState> {
    w: { [key: string]: any } = {}; // Store references to the widgets
    s: { [key: string]: any } = {}; // widgets data
    c: { [key: string]: boolean } = {}; // widgets data
    focus: string | undefined = "";
    prevFocus: string = "";
    formRef = React.createRef<HTMLDivElement>();
    okButtonText: string = "Ok";
    cancelButtonText: string = "Cancel";

    constructor(props: Q2FrontFormProps) {
        super(props);
        this.state = {
            formData: {},
            panelChecks: {}, // Track checkbox state for panels
            okButtonText: "Ok",
            cancelButtonText: "Cancel",
        };
        // Provide pointer to Form.s on Q2Form instance
        this.updateQ2FormLinks();
        // console.log("FC", this.s);
    }

    private updateQ2FormLinks() {
        if (this.props.q2form) {
            (this.props.q2form as any).s = this.s;
            (this.props.q2form as any).w = this.w;
        }
    }

    componentDidMount() {

        const formData = this.props.q2form.columns.reduce((acc: any, column: any) => {
            acc[column.column] = column.data || "";
            return acc;
        }, {});
        this.setState({ formData });
        // console.log(formData)
        // console.log(this.state.formData)

        document.addEventListener("keydown", this.handleKeyDown);

        // Focus on the first focusable element after a short delay to ensure rendering is complete
        setTimeout(() => {
            focusFirstFocusableElement(this.formRef.current);
        }, 100);
        // console.log("DM", this.s);
        if (typeof this.props.q2form?.hookShow === "function") {
            this.props.q2form.hookShow(this);
        }
    }

    // componentDidUpdate(prevProps: FormProps, prevState: { formData: { [key: string]: any } }) {
    componentDidUpdate(_: any, prevState: { formData: { [key: string]: any } }) {
        // Focus input when a check-linked input becomes checked
        // console.log("DU", this.s)
        // this.scanAndCopyValues();
        this.updateQ2FormLinks();
        Object.keys(this.state.formData).forEach(column => {
            if (
                this.state.formData[column] &&
                !prevState.formData?.[column] &&
                this.w[column] &&
                typeof this.w[column]?.focus === "function"
            ) {
                this.w[column].focus();
            }
        });
    }

    componentWillUnmount() {
        // this.resizeObserver.disconnect();
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    handleFocus = () => {
        // console.log("valid", this.prevFocus, this.focus)
        if (typeof this.w[this.prevFocus]?.props.column.valid === "function") {
            // const validResult = this.w[this.prevFocus].props.column.valid(this);
        }
        this.scanAndCopyValues();
        if (typeof this.props.q2form?.hookFocusChanged === "function") {
            this.props.q2form.hookFocusChanged(this)
        }
    }

    handleKeyDown = (event: any) => {
        if (event.key === "Escape" && this.props.isTopDialog) {
            this.handleCancel();
        }
    };

    handleResize = () => {
    };

    handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => {
        const { name } = e.target;
        this.scanAndCopyValues();
        // Call hookFocusChanged for the current input before rerender
        if (typeof this.props.q2form?.hookInputChanged === "function") {
            this.focus = name;
            this.props.q2form.hookInputChanged(this);
        }
        // if (name !== "") {
        //     this.setState((prevState) => ({
        //         formData: {
        //             ...prevState.formData,
        //             [name]: value,
        //         },
        //     }), this.handleResize);
        // }
    };

    handleSubmit = () => {
        // console.log("Form submitted:", this.state.formData);
        let close: boolean = true;
        if (typeof this.props.q2form?.hookSubmit === "function") {
            close = this.props.q2form.hookSubmit(this);
        }

        if (close && this.props.onClose) this.props.onClose();
    };

    handleAction = (action: any) => {
        if (action.label === "Exit" && this.props.onClose) {
            this.props.onClose();
        } else {
            // console.log(action.label);
        }
    };

    handleCancel = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    getWidgetData = (columnName: string) => {
        return this.w[columnName]?.getData();
    };

    setWidgetData = (columnName: string, value: any) => {
        if (this.w[columnName]) {
            this.w[columnName].setValue(value);
        }
    };

    getWidgetCheck = (columnName: string) => {
        return this.w[columnName]?.props.column.checkChecked;
    };

    scanAndCopyValues = () => {
        Object.keys(this.w).forEach(key => {
            if (this.w[key] && typeof this.w[key].getData === 'function') {
                this.s[key] = this.getWidgetData(key);

                if (this.w[key] && this.w[key].props && this.w[key].props.col) {
                    this.w[key].props.column.data = this.s[key];
                }
                if (this.w[key]?.props.column.check) {
                    this.c[key] = this.getWidgetCheck(key);
                }
            }
            else {
                delete this.s[key];
                delete this.w[key];
            }
        });
    };

    renderInput = (column: Q2Control) => {
        // Set initial checkChecked for checkable controls
        if (column.check && typeof column.checkChecked === "undefined") {
            column.checkChecked = !!column.data;
        }
        const commonProps = {
            column: column,
            form: this,
            ref: (ref: any) => { this.w[column.column] = ref; }, // Store reference to the widget
        };
        if (column.column === "/s") {
            column.control = "spacer"
        }
        switch (column.control) {
            case "text":
                return <Q2Text {...commonProps} />;
            case "line":
                return <Q2Line {...commonProps} />
            case "color":
                return <Q2Color {...commonProps} />
            case "combo":
                return <Q2Combo {...commonProps} />
            case "spacer":
                return <Q2Spacer {...commonProps} />;
            case "check":
                return <Q2CheckBox {...commonProps} />;
            case "radio":
                return <Q2RadioButton {...commonProps} />;
            case "image":
                return <Q2Image {...commonProps} />;
            case "form":
                column.data.subForm = true;
                return <Q2FrontForm q2form={column.data} />
            case "widget":
                {
                    if (typeof column.data === "object" && column.data?.widget) {
                        return <column.data.widget {...(column.data.props || {})} />;
                    }
                    else if (typeof column.data === "function") {
                        return <column.data />;
                    }
                }
                return null;
            default:
                return <Q2Line {...commonProps} />;
        }
    };

    createFormTree = (columns: any) => {
        const stack: any[] = [];
        const root = { column: 'root', children: [{ key: 'root-0', column: undefined }] };
        stack.push(root);
        if (!columns[0].column.startsWith("/")) {
            columns.splice(0, 0, { column: "/f", key: 'root-1' });
        }
        let tabs: any = {};
        columns.forEach((col: Q2Control, index: number) => {
            if (col.column === "/t") {
                if ("children" in tabs) {
                    let idx = stack.length - 1;
                    while (stack[idx]?.isTabPage !== true || idx === 0) {
                        stack.pop();
                        idx -= 1;
                    }
                    stack.pop();

                    tabs.label = tabs.label + `;${col.label}`;
                    tabs.isTabWidget = true;
                }
                else { // First tab came
                    const panel = {
                        label: col.label,
                        isTabWidget: true,
                        key: `tabWidget-${col.column}-${index}}`, // Generate unique key
                        children: [],
                        column: col,
                    };

                    stack[stack.length - 1].children.push(panel);
                    tabs = panel
                    stack.push(panel);
                }

            }

            if (col.column.startsWith("/h") ||
                col.column.startsWith("/v") ||
                col.column.startsWith("/f") ||
                col.column.startsWith("/t")) {
                const panel = {
                    label: col.label,
                    key: `${col.column}-${index}`, // Generate unique key
                    children: [],
                    isTabPage: col.column === "/t" ? true : false,
                    column: col,
                };
                stack[stack.length - 1].children.push(panel);
                stack.push(panel);
            } else if (col.column === "/") {
                if (stack.length > 1) {
                    stack.pop();
                }
                if (stack[stack.length - 1]?.isTabWidget) {
                    tabs = {};
                    stack.pop();
                }
            } else {
                col.key = col.key || `${col.column}-${index}-${Math.random().toString(36).substring(2, 9)}`; // Ensure unique key for other columns
                // Set initial checkChecked for checkable controls
                if (col.check && typeof col.checkChecked === "undefined") {
                    col.checkChecked = !!col.data;
                }
                this.s[col.column] = col.data;
                this.c[col.column] = !!col.checkChecked;
                stack[stack.length - 1].children.push(col);
            }
        });
        // console.log(root)
        return root;
    };

    // Add handler for panel checkbox toggle
    handlePanelCheck = (panelKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState((prevState) => ({
            panelChecks: {
                ...prevState.panelChecks,
                [panelKey]: e.target.checked,
            }
        }));
    };

    renderPanel = (panel: any) => {
        if (!panel || !panel.children) return null;
        // Use Q2Panel for rendering the panel
        return (
            <Q2Panel
                panel={panel}
                form={this}
                onChange={this.handlePanelCheck(panel.key)}
                formData={this.state.formData}
                setState={this.setState.bind(this)}
            />
        );
    };

    render() {
        const { q2form, onClose, isTopDialog } = this.props;
        const { okButtonText, cancelButtonText } = this.state;
        // If q2form contains tabular data, render DataGrid instead of the standard form
        if (q2form?.data && Array.isArray(q2form.data) && q2form.data.length > 0) {
            // ensure non-optional props for DataGrid
            return <DataGrid q2form={q2form} onClose={onClose ?? (() => { })} isTopDialog={!!isTopDialog} />;
        }

        const { columns } = q2form;
        const hasOkButton = this.props.q2form.hasOkButton;
        const subForm = this.props.q2form?.subForm;
        const hasCancelButton = this.props.q2form.hasCancelButton;
        const structuredColumns = this.createFormTree(columns);

        return (
            <div ref={this.formRef} className="FormComponent" >
                {structuredColumns.children && structuredColumns.children.map((panel) => this.renderPanel(panel))}

                {((hasOkButton || hasCancelButton) && !subForm) && (
                    <div className="FormBottomButtons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {hasOkButton && <Q2Button  {...{
                            column: new Q2Control(
                                "ok",
                                okButtonText,
                                { valid: this.handleSubmit }
                            )
                        }}
                        />}
                        {hasCancelButton && <Q2Button  {...{
                            column: new Q2Control(
                                "cancel",
                                cancelButtonText,
                                { valid: this.handleCancel })
                        }}
                        />}

                    </div>
                )}

            </div>
        );
    }
}

export default Q2FrontForm;