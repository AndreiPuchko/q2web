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

class Form extends Component<FormProps, { formData: { [key: string]: any }, panelChecks: { [key: string]: boolean } }> {
  w: { [key: string]: any } = {}; // Store references to the widgets
  s: { [key: string]: any } = {}; // widgets data
  focus: string = "";
  prevFocus: string = "";
  formRef = React.createRef<HTMLDivElement>();
  constructor(props: FormProps) {
    super(props);
    this.state = {
      formData: {},
      panelChecks: {}, // Track checkbox state for panels
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
    col["id"] = `${col.column}-${col.key}`;
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
        return <Form metaData={col.data} />
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
    const fieldSetStyle = { border: "none", margin: 0, padding: 0, width: "100%" };

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
    const hasCheck = panel.metadata?.check;
    const checked = hasCheck
      ? (this.state.panelChecks[panel.key] !== undefined
        ? this.state.panelChecks[panel.key]
        : true)
      : true;

    // Only disable the panel content, not the checkbox itself

    return (
      <div className={className} style={rootStyle} key={panel.key}>
        {panel.label && (
          hasCheck ? (
            <div className="group-box-title">
              <input
                id={panel_id}
                key={panel_id}
                type="checkbox"
                checked={checked}
                onChange={this.handlePanelCheck(panel.key)}
              />
              <label htmlFor={panel_id}>{panel.label}</label>
            </div>
          ) : (
            <div className="group-box-title">{panel.label}</div>
          )
        )}
        <fieldset
          style={fieldSetStyle}
          disabled={hasCheck && !checked}
        >
          <div style={style}>
            {panel.children.map((child: any, index: number) => {
              const id = `${child.id}-control-cb`;
              if (child.children) {
                //render panel
                return (
                  <div key={child.key + `-form-group1-${index}`} style={{ gridColumn: "1 / span 2" }}>
                    {this.renderPanel(child)}
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
                          checked={!!this.state.formData?.[child.column]}
                          onChange={e => {
                            const checked = e.target.checked;
                            this.setState(
                              prevState => ({
                                formData: {
                                  ...prevState.formData,
                                  [child.column]: checked
                                }
                              }),
                              () => {
                                if (checked && typeof this.w[child.column].focus === "function") {
                                  this.w[child.column].focus();
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
                        {child.label && child.control !== "check" ? child.label : ""}:
                      </label>
                    }
                    {child.control !== "label" &&
                      <div key={child.key + `-form-group-${index}`} className="form-group" >
                        {child.check ? (
                          <fieldset
                            style={fieldSetStyle}
                            disabled={!this.state.formData?.[child.column]}
                          >
                            {this.renderInput(child)}
                          </fieldset>
                        ) : (
                          this.renderInput(child)
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
  };

  componentDidUpdate(prevProps: FormProps, prevState: { formData: { [key: string]: any } }) {
    // Focus input when a check-linked input becomes checked
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

  render() {
    const { columns } = this.props.metaData;
    const hasOkButton = this.props.metaData.hasOkButton;
    const subForm = this.props.metaData?.subForm;
    const hasCancelButton = this.props.metaData.hasCancelButton;
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