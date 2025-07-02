import React, { Component, CSSProperties } from "react";
import './Form.css'; // Import the CSS file for styling
import Q2Line from './widgets/Line'; // Import the Line widget
import Q2Text from './widgets/Text'; // Import the Text widget
import Spacer from './widgets/Spacer'; // Import the Spacer widget
import Q2CheckBox from './widgets/CheckBox'; // Import the CheckBox widget
import { focusFirstFocusableElement } from '../utils/dom';
import Q2RadioButton from "./widgets/RadioButton";
import Q2Button from './widgets/Button';
import { Q2Form } from "../q2_modules/Q2Form";
import Q2Panel from './widgets/Panel';
import { GiConsoleController } from "react-icons/gi";

interface FormProps {
  q2form: Q2Form;
  onClose: () => void;
  rowData?: any;
  isTopDialog: boolean;
}

class Form extends Component<FormProps, { formData: { [key: string]: any }, panelChecks: { [key: string]: boolean } }> {
  w: { [key: string]: any } = {}; // Store references to the widgets
  s: { [key: string]: any } = {}; // widgets data
  c: { [key: string]: boolean } = {}; // widgets data
  focus: string = "";
  prevFocus: string = "";
  formRef = React.createRef<HTMLDivElement>();

  constructor(props: FormProps) {
    super(props);
    this.state = {
      formData: {},
      panelChecks: {}, // Track checkbox state for panels
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

    const { rowData } = this.props;
    const formData = this.props.q2form.columns.reduce((acc: any, column: any) => {
      acc[column.column] = rowData ? rowData[column.column] : column.data || "";
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
  }

  componentDidUpdate(prevProps: FormProps, prevState: { formData: { [key: string]: any } }) {
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
    if (typeof this.w[this.prevFocus]?.props.col.valid === "function") {
      const validResult = this.w[this.prevFocus].props.col.valid(this);
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

  handleChange = (e: any) => {
    const { name, value } = e.target;
    this.scanAndCopyValues();
    // Call hookFocusChanged for the current input before rerender
    if (typeof this.props.q2form?.hookInputChanged === "function") {
      this.focus = name;
      this.props.q2form.hookInputChanged(this);
    }
    if (name !== "") {
      this.setState((prevState) => ({
        formData: {
          ...prevState.formData,
          [name]: value,
        },
      }), this.handleResize);

      // Also update the widget's col.data if possible
      if (this.w[name] && this.w[name].props && this.w[name].props.col) {
        this.w[name].props.col.data = value;
      }
    }
  };

  handleSubmit = () => {
    // e.preventDefault();
    console.log("Form submitted:", this.state.formData);
    this.props.onClose();
  };

  handleAction = (action: any) => {
    if (action.label === "Exit") {
      this.props.onClose();
    } else {
      // console.log(action.label);
    }
  };

  handleCancel = () => {
    this.props.onClose();
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
    return this.w[columnName]?.props.col.checkChecked;
  };


  scanAndCopyValues = () => {
    Object.keys(this.w).forEach(key => {
      if (this.w[key] && typeof this.w[key].getData === 'function') {
        this.s[key] = this.getWidgetData(key);
        this.c[key] = this.getWidgetCheck(key);
      }
      else {
        delete this.s[key];
        delete this.w[key];
      }
    });
  };

  renderInput = (col: any) => {
    const { formData } = this.state;
    const data: any = formData[col.column] !== undefined ? formData[col.column] : "";
    // console.log(col.column, data)
    // console.log(this.state.formData)

    col["id"] = `${col.column}-${col.key}`;
    // Set initial checkChecked for checkable controls
    if (col.check && typeof col.checkChecked === "undefined") {
      col.checkChecked = !!col.data;
    }
    const commonProps = {
      id: col["id"],
      name: col.column,
      col: col,
      data,
      onChange: this.handleChange,
      readOnly: col.readonly || false,
      form: this,
      valid: col.valid || (() => true),
      ref: (ref: any) => {
        this.w[col.column] = ref;
      }, // Store reference to the widget
    };
    // console.log('col.control', commonProps.value);
    if (col.column === "/s") {
      col.control = "spacer"
    }
    switch (col.control) {
      case "text":
        return <Q2Text {...commonProps} />;
      case "line":
        return <Q2Line {...commonProps} />
      case "spacer":
        return <Spacer {...commonProps} />;
      case "check":
        return <Q2CheckBox {...commonProps} />;
      case "radio":
        return <Q2RadioButton {...commonProps} />;
      case "form":
        col.data.subForm = true;
        return <Form q2form={col.data} />
      case "widget":
        return <col.data />;
      default:
        return <Q2Line {...commonProps} />;
    }
  };

  createFormTree = (columns: any) => {
    const stack: any[] = [];
    const root = { column: 'root', children: [{ column: "/v", key: 'root-0', metadata: undefined }] };
    stack.push(root);
    if (!columns[0].column.startsWith("/")) {
      columns.splice(0, 0, { column: "/f", key: 'root-1' });
    }

    columns.forEach((col: any, index: number) => {
      if (col.column === "/h" || col.column === "/v" || col.column === "/f") {
        const panel = {
          column: col.column,
          label: col.label,
          key: `${col.column}-${index}}`, // Generate unique key
          children: [],
          metadata: col,
        };
        stack[stack.length - 1].children.push(panel);
        stack.push(panel);
      } else if (col.column === "/") {
        if (stack.length > 1) {
          stack.pop();
        }
      } else {
        col.key = col.key || `${col.column}-${index}-${Math.random().toString(36).substr(2, 9)}`; // Ensure unique key for other columns
        // Set initial checkChecked for checkable controls
        if (col.check && typeof col.checkChecked === "undefined") {
          col.checkChecked = !!col.data;
        }
        this.s[col.column] = col.data;
        this.c[col.column] = col.checkChecked;
        stack[stack.length - 1].children.push(col);
      }
    });

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

  renderPanel = (panel: any, root = false) => {
    if (!panel || !panel.children) return null;

    let className = panel.column === "/h" ? "Panel flex-row group-box" : "Panel flex-column group-box";
    let style: CSSProperties = { display: "flex", flex: 1, padding: "0.5cap" };
    const rootStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-center', width: 'auto' };

    if (panel.column === "/f") {
      // 2-column grid: label right, input left
      className += " panel-formgrid";
      style = {
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        // alignItems: "center",
        gap: "0.2em",
        padding: "0.5cap"
      };
    } else if (panel.column === "/v") {
      style.flexDirection = 'column';
    } else {
      style.flexDirection = 'row';
    }
    style.alignItems = 'start';
    style.justifyContent = 'flex-start';
    if ([4, 5, 6].includes(panel?.metadata?.alignment)) {
      style.alignItems = 'center';
    }
    if (panel.label === "") {
      rootStyle.border = "none";
      rootStyle.margin = "0px";
      rootStyle.padding = "0px";
    }

    if (!root && (panel.column === "/v" || panel.column === "/f")) {
      // rootStyle.width = '100%';
    }
    const panel_id = `${panel.key}-panel-id`;

    // Determine if this panel should be disabled
    const checked = panel.metadata?.check
      ? (this.state.panelChecks[panel.key] !== undefined
        ? this.state.panelChecks[panel.key]
        : true)
      : true;

    // Ensure checkChecked is set for panel's checkbox
    if (panel.metadata?.check && typeof panel.metadata.checkChecked === "undefined") {
      panel.metadata.checkChecked = false;
    }

    // Use Q2Panel for rendering the panel
    return (
      <Q2Panel
        key={panel.key}
        id={panel_id}
        name={panel.key}
        col={panel.metadata}
        data={checked}
        onChange={this.handlePanelCheck(panel.key)}
        readOnly={false}
        form={this}
        valid={panel.metadata?.valid}
        // Assign ref if tag exists
        ref={panel.metadata?.tag ? (ref: any) => { this.w[panel.metadata.tag] = ref; } : undefined}
        // Pass children and render helpers to Q2Panel
        children={panel.children}
        renderInput={this.renderInput}
        renderPanel={this.renderPanel}
        formData={this.state.formData}
        w={this.w}
        setState={this.setState.bind(this)}
      />
    );
  };

  render() {
    const { columns } = this.props.q2form;
    const hasOkButton = this.props.q2form.hasOkButton;
    const subForm = this.props.q2form?.subForm;
    const hasCancelButton = this.props.q2form.hasCancelButton;
    const structuredColumns = this.createFormTree(columns);

    return (
      <div ref={this.formRef} className="FormComponent" >
        {structuredColumns.children && structuredColumns.children.map((panel) => this.renderPanel(panel, true))}

        {((hasOkButton || hasCancelButton) && !subForm) && (
          <div className="FormBottomButtons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {hasOkButton && <Q2Button label="OK" onClick={this.handleSubmit} />}
            {hasCancelButton && <Q2Button label="Cancel" onClick={this.handleCancel} />}
          </div>
        )}

      </div>
    );
  }
}

export default Form;