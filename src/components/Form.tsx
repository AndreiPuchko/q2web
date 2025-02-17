import React, { Component } from "react";
import './Form.css'; // Import the CSS file for styling
import Line from './widgets/Line'; // Import the Line widget
import Text from './widgets/Text'; // Import the Text widget

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
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
    document.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
  }

  handleKeyDown = (event) => {
    if (event.key === "Escape" && this.props.isTopDialog) {
      this.handleCancel();
    }
  };

  handleResize = () => {
    const { formRef } = this;
    if (formRef.current) {
      const formHeight = formRef.current.clientHeight;
      const formWidth = formRef.current.clientWidth;

      // Recalculate the height of Text objects
      this.props.metaData.columns.forEach(col => {
        if (col.control === 'text') {
          const textElement = formRef.current.querySelector(`#${col.column}`);
          if (textElement) {
            textElement.style.height = `${formHeight / 2}px`; // Example: set height to half of form height
          }
        }
      });
    }
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
    };
    console.log("commonProps", col);
    switch (col.control) {
      case "text":
        return <Text {...commonProps} />;
      case "line":
        return <Line {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  createFormTree = (columns) => {
    const stack = [];
    const root = { column: 'root', children: [{ column: "/v" }] };
    stack.push(root);
    if (!columns[0].column.startsWith("/")) {
      columns.splice(0, 0, { column: "/f", key: -1 });
    }

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

    return root;
  };

  renderPanel = (panel) => {
    if (!panel || !panel.children) return null;

    const className = panel.column === "/h" ? "flex-row group-box" : "flex-column group-box";
    let style = { display: "flex", flex: 1 };
    if (panel.column === "/v") {
      style.flexDirection = 'column'
    } else {
      style.flexDirection = 'row'
    }

    return (
      <div className={className} style={{ display: 'flex', justifyContent: 'flex-center' }}>
        {panel.label && <div className="group-box-title">{panel.label}</div>}
        {panel.children.map((child, index) => {
          if (child.children) {
            return this.renderPanel(child);
          }
          else {
            return (
              <div key={child.key} className="form-group" style={style}>
                <label className="form-label">{child.label}</label>
                {this.renderInput(child)}
              </div>
            );
          }
        })}
      </div >
    );
  };

  render() {
    const { columns } = this.props.metaData;
    const hasOkButton = this.props.metaData.hasOkButton;
    const hasCancelButton = this.props.metaData.hasCancelButton;

    const structuredColumns = this.createFormTree(columns);

    return (
      <div style={{ height: '100%', border: "2px solid green" }} _can_grow_height="true" _can_grow_width="true">
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

export default Form;