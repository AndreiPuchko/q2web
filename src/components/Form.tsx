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

interface FormProps {
  metaData: Q2Form;
  onClose: () => void;
  rowData?: any;
  isTopDialog: boolean;
}

class Form extends Component<FormProps, { formData: { [key: string]: any } }> {
  w: { [key: string]: any } = {}; // Store references to the widgets
  s: { [key: string]: any } = {}; // widgets data
  focus: string = "";
  prevFocus: string = "";
  formRef = React.createRef<HTMLDivElement>();
  constructor(props: FormProps) {
    super(props);
    this.state = {
      formData: {},
    };
  }

  componentDidMount() {
    const { rowData } = this.props;
    const formData = this.props.metaData.columns.reduce((acc: any, column: any) => {
      acc[column.column] = rowData ? rowData[column.column] : column.value || "";
      return acc;
    }, {});
    this.setState({ formData });

    document.addEventListener("keydown", this.handleKeyDown);

    // Focus on the first focusable element after a short delay to ensure rendering is complete
    setTimeout(() => {
      focusFirstFocusableElement(this.formRef.current);
    }, 100);
  }

  componentWillUnmount() {
    // this.resizeObserver.disconnect();
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleFocus = () => {
    // console.log("valid", this.prevFocus, this.focus)
    if (typeof this.w[this.prevFocus]?.props.col.valid === "function") {
      this.scanAndCopyValues();
      const validResult = this.w[this.prevFocus].props.col.valid(this);
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
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }), this.handleResize);
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
      console.log(action.label);
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

  scanAndCopyValues = () => {
    Object.keys(this.w).forEach(key => {
      if (this.w[key] && typeof this.w[key].getData === 'function') {
        this.s[key] = this.getWidgetData(key);
      }
    });
  };

  renderInput = (col: any) => {
    const { formData } = this.state;
    const data: any = formData[col.column] !== undefined ? formData[col.column] : "";
    const commonProps = {
      id: col.column,
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
    switch (col.control) {
      case "text":
        return <Q2Text {...commonProps} />;
      case "line":
        return <Q2Line {...commonProps} />;
      case "spacer":
        return <Spacer {...commonProps} />;
      case "check":
        return <Q2CheckBox {...commonProps} />;
      case "radio":
        return <Q2RadioButton {...commonProps} />;
      case "form":
        col.data.subForm = true;
        return <Form metaData={col.data} />
      case "widget":
        return col.data()
      default:
        return <Q2Line {...commonProps} />;
    }
  };

  createFormTree = (columns: any) => {
    const stack: any[] = [];
    const root = { column: 'root', children: [{ column: "/v", key: 'root-0' }] };
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
        };
        stack[stack.length - 1].children.push(panel);
        stack.push(panel);
      } else if (col.column === "/") {
        if (stack.length > 1) {
          stack.pop();
        }
      } else {
        col.key = col.key || `${col.column}-${index}-${Math.random().toString(36).substr(2, 9)}`; // Ensure unique key for other columns
        stack[stack.length - 1].children.push(col);
      }
    });

    return root;
  };

  renderPanel = (panel: any, root = false) => {
    if (!panel || !panel.children) return null;

    const className = panel.column === "/h" ? "Panel flex-row group-box" : "Panel flex-column group-box";
    const style: CSSProperties = { display: "flex", flex: 1, padding: "0 1cap 1cap 0" };
    if (panel.column === "/v") {
      style.flexDirection = 'column'
    } else {
      style.flexDirection = 'row'
    }
    style.alignItems = 'start';

    const rootStyle = { display: 'flex', justifyContent: 'flex-center', width: 'auto' };

    if (!root && (panel.column === "/v" || panel.column === "/f")) {
      rootStyle.width = '100%';
    }

    return (
      <div className={className} style={rootStyle} key={panel.key}>
        {panel.label && <div className="group-box-title">{panel.label}</div>}
        {panel.children.map((child: any, index: number) => {
          if (child.children) {
            return this.renderPanel(child);
          }
          else {
            return (
              <div key={child.key || index} className="form-group" style={style}>
                {child.control !== "check" && <label className="form-label">{child.label}</label>}
                {this.renderInput(child)}
              </div>
            );
          }
        })}
      </div>
    );
  };

  render() {
    const { columns } = this.props.metaData;
    const hasOkButton = this.props.metaData.hasOkButton;
    const subForm = this.props.metaData?.subForm;
    const hasCancelButton = this.props.metaData.hasCancelButton;
    const structuredColumns = this.createFormTree(columns);
    // this.scanAndCopyValues();

    return (
      <div ref={this.formRef} className="FormComponent" >
        {/* <div ref={this.formRef} className="FormComponent" _can_grow_height="true" _can_grow_width="true"> */}
        {structuredColumns.children && structuredColumns.children.map((panel) => this.renderPanel(panel, true))}
        {((hasOkButton || hasCancelButton) && !subForm) && (
          <div className="FormBottomButtons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {hasOkButton && <Q2Button label="OK" onClick={this.handleSubmit} />}
            {hasCancelButton && <Q2Button label="Cancel" onClick={this.handleCancel} />}
          </div>
        )}
        {/* <Spacer />  */}
        {/* Add Spacer widget here */}
      </div>
    );
  }
}

export default Form;