import React, { Component } from "react";
import { forms } from "../data_modules/data";

class DataGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleRows: 20, // Начальное количество отображаемых строк
      selectedRow: 0, // Initially row 0 is selected
    };
    this.tableBodyRef = React.createRef();
  }

  componentDidMount() {
    this.tableBodyRef.current.addEventListener("scroll", this.handleScroll);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    this.tableBodyRef.current.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.tableBodyRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.setState((prevState) => ({ visibleRows: prevState.visibleRows + 10 }), this.scrollToRow);
    }
  };

  handleRowClick = (index) => {
    this.setState({ selectedRow: index }, this.scrollToRow);
  };

  handleKeyDown = (event) => {
    const { selectedRow, visibleRows } = this.state;
    const { currentFormKey } = this.props;
    const dataLength = forms[currentFormKey].data.length;
    const rowElement = this.tableBodyRef.current.querySelector('tbody tr');
    const rowsPerPage = rowElement ? Math.floor(this.tableBodyRef.current.clientHeight / rowElement.offsetHeight) : 0;
    if (event.key === "ArrowUp" && !event.ctrlKey && selectedRow > 0) {
      this.setState({ selectedRow: selectedRow - 1 }, this.scrollToRow);
      event.preventDefault();
    } else if (event.key === "ArrowDown" && !event.ctrlKey && selectedRow < dataLength - 1) {
      this.setState({ selectedRow: selectedRow + 1 }, this.scrollToRow);
      event.preventDefault();
    } else if (event.key === "PageUp" && selectedRow > 0) {
      this.setState({ selectedRow: Math.max(selectedRow - rowsPerPage, 0) }, this.scrollToRow);
      event.preventDefault();
    } else if (event.key === "PageDown" && selectedRow < dataLength - 1) {
      const newVisibleRows = Math.min(visibleRows + rowsPerPage, dataLength);
      this.setState({ visibleRows: newVisibleRows, selectedRow: Math.min(selectedRow + rowsPerPage, dataLength - 1) }, () => {
        this.scrollToRow();
        this.handleScroll();
      });
      event.preventDefault();
    } else if (event.key === "Home") {
      this.setState({ selectedRow: 0 }, this.scrollToRow);
      event.preventDefault();
    } else if (event.key === "End") {
      const newVisibleRows = dataLength;
      this.setState({ visibleRows: newVisibleRows, selectedRow: dataLength - 1 }, () => {
        this.scrollToRow();
        this.handleScroll();
      });
      event.preventDefault();
    }
  };

  scrollToRow = () => {
    const rowElement = this.tableBodyRef.current.querySelector(`tbody tr:nth-child(${this.state.selectedRow + 1})`);
    if (rowElement) {
      const { offsetTop, offsetHeight } = rowElement;
      const { scrollTop, clientHeight } = this.tableBodyRef.current;
      const headerHeight = this.tableBodyRef.current.querySelector('thead').offsetHeight;
      const rowBottom = offsetTop + offsetHeight;
      const viewBottom = scrollTop + clientHeight;
      if (offsetTop < scrollTop + headerHeight || rowBottom > viewBottom) {
        if (offsetTop < scrollTop + headerHeight) {
          this.tableBodyRef.current.scrollTop = offsetTop - headerHeight;
        } else if (rowBottom > viewBottom) {
          this.tableBodyRef.current.scrollTop = rowBottom - clientHeight;
        }
      }
    }
  };

  render() {
    const { currentFormKey } = this.props;
    const { columns, data } = forms[currentFormKey];
    const { visibleRows, selectedRow } = this.state;
    return (
      <div className="DataGridComponent" ref={this.tableBodyRef} onScroll={this.handleScroll} _can_grow_height="true" _can_grow_width="true">
        <table>
          <thead className="DataGrigHeader">
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, visibleRows).map((row, index) => (
              <tr
                key={index}
                onClick={() => this.handleRowClick(index)}
                style={{ backgroundColor: selectedRow === index ? '#d3d3d3' : 'transparent' }}
              >
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

DataGrid.defaultProps = {
  CanGrowHeight: true,
  CanGrowWidth: true,
};

export default DataGrid;