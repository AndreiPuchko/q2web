import React, { Component } from "react";
import { forms } from "../data_modules/data";
import './Form.css'; // Import the CSS file for styling

interface FormProps {
  metaData: Q2Form;
  onClose: () => void;
  rowData?: any;
  isTopDialog: boolean;
}

class Form extends Component<FormProps> {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { rowData } = this.props;
    const formData = this.props.metaData.columns.reduce((acc, column) => {
      acc[column.column] = rowData ? rowData[column.column] : column.value || "";
      return acc;
    }, {});
    this.setState({ formData });

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.formRef.current);

    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    if (event.key === "Escape" && this.props.isTopDialog) {
      this.handleCancel();
    }
  };

  handleResize = () => {
    const formGroups = this.formRef.current.querySelectorAll('.form-group');
    const totalHeight = this.formRef.current.clientHeight;
    let usedHeight = 0;

    formGroups.forEach(formGroup => {
      if (!formGroup.querySelector('textarea')) {
        usedHeight += formGroup.offsetHeight;
      }
    });

    const okButton = this.formRef.current.querySelector('button[type="submit"]');
    const okButtonHeight = okButton ? okButton.offsetHeight : 0;

    const availableHeight = totalHeight - usedHeight - okButtonHeight;
    const textareas = this.formRef.current.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const label = textarea.parentElement.querySelector('label');
      const labelHeight = label ? label.offsetHeight : 0;
      textarea.style.height = `${(availableHeight / textareas.length) - labelHeight}px`;
      textarea.style.width = '99%'; // Ensure textarea width is 100% to avoid horizontal scrollbar
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }), this.handleResize);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", this.state.formData);
    this.props.onClose();
  };

  handleAction = (action) => {
    if (action.label === "Exit") {
      this.props.onClose();
    } else {
      console.log(action.label);
    }
  };

  handleCancel = () => {
    this.props.onClose();
  };

  renderInput = (col) => {
    const { formData } = this.state;
    const commonProps = {
      id: col.column,
      name: col.column,
      value: formData[col.column],
      onChange: this.handleChange,
      readOnly: col.readonly || false,
      style: col.control === "textarea" || col.control === "text" ? { width: '100%' } : { width: '100%' } // Make the input field large
    };

    switch (col.control) {
      case "textarea":
      case "text":
        return <textarea {...commonProps} />;
      case "select":
        return (
          <select {...commonProps}>
            {col.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  createFormTree = (columns) => {
    const stack = [];
    const root = { column: 'root', children: [] };
    stack.push(root);

    columns.forEach((col) => {
      if (col.column === "/h" || col.column === "/v" || col.column === "/f") {
        const panel = {
          column: col.column,
          label: col.label,
          children: [],
        };
        stack[stack.length - 1].children.push(panel);
        stack.push(panel);
      } else if (col.column === "/") {
        if (stack.length > 1) {
          stack.pop();
        }
      } else {
        stack[stack.length - 1].children.push(col);
      }
    });

    console.log("Form tree:", JSON.stringify(root, null, 2));
    return root;
  };

  renderPanel = (panel) => {
    if (!panel || !panel.children) return null;

    const className = panel.column === "/h" ? "flex-row group-box" : "flex-column group-box";

    return (
      <div className={className}>
        {panel.label && <div className="group-box-title">{panel.label}</div>}
        {panel.children.map((child, index) => {
          if (child.column && panel.column !== 'root') {
            return this.renderPanel(child);
          } else {
            return (
              <div key={child.key} className="form-group" style={child.control === "textarea" || child.control === "text" ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
                <label htmlFor={child.column}>{child.label}</label>
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
    const hasCancelButton = this.props.metaData.hasCancelButton;

    const structuredColumns = this.createFormTree(columns);

    return (
      <div style={{ height: '100%' }} _can_grow_height="true" _can_grow_width="true">
        <form ref={this.formRef} onSubmit={this.handleSubmit} className="FormComponent" style={{ height: '100%' }}>
          {structuredColumns.children && structuredColumns.children.map((panel, index) => this.renderPanel(panel))}
          {(hasOkButton || hasCancelButton) && (
            <div className="FormBottomButtons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {hasOkButton && <button type="submit">Ok</button>}
              {hasCancelButton && <button type="button" onClick={this.handleCancel}>Cancel</button>}
            </div>
          )}
        </form>
      </div>
    );
  }
}

Form.defaultProps = {
  CanGrowHeight: true,
  CanGrowWidth: true,
};

export default Form;