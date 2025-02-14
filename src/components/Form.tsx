import React, { Component } from "react";
import { forms } from "../data_modules/data";

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
    };
  }

  componentDidMount() {
    const { currentFormKey } = this.props;
    const formData = forms[currentFormKey].columns.reduce((acc, column) => {
      acc[column.column] = "";
      return acc;
    }, {});
    this.setState({ formData });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", this.state.formData);
  };

  handleAction = (action) => {
    if (action.label === "Exit") {
      this.props.onClose();
    } else {
      console.log(action.label);
    }
  };

  render() {
    const { currentFormKey } = this.props;
    const { columns, actions } = forms[currentFormKey];
    const { formData } = this.state;

    return (
      <div style={{ height: '100%' }} _can_grow_height="true" _can_grow_width="true">
        <form onSubmit={this.handleSubmit} className="FormComponent">
          {columns.map((col) => (
            <div key={col.key} className="form-group">
              <label htmlFor={col.column}>{col.label}</label>
              <input
                type="text"
                id={col.column}
                name={col.column}
                value={formData[col.column]}
                onChange={this.handleChange}
              />
            </div>
          ))}
          <button type="submit">Submit</button>
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