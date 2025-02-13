import React, { Component } from "react";

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleRows: 20, // Начальное количество отображаемых строк
    };
    this.tableBodyRef = React.createRef();
  }

  componentDidMount() {
    this.tableBodyRef.current.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    this.tableBodyRef.current.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.tableBodyRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.setState((prevState1) => ({ visibleRows: prevState1.visibleRows + 10 }));
    }
  };

  render() {
    const { columns, data } = this.props;
    const { visibleRows } = this.state;
    return (
      <div className="DataGridComponent" ref={this.tableBodyRef} onScroll={this.handleScroll}>
        <table >
          <thead className="DataGrigHeader">
            <tr>
              {columns.map((col) => (
                <th key={col.key} >{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, visibleRows).map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DataTable;