import React, { Component } from "react";
import { forms } from "../data_modules/data";
import { MdOutlineExitToApp, MdOutlineCropPortrait, MdOutlineContentCopy, MdEdit, MdClose } from "react-icons/md";

const EDIT = "EDIT";
const NEW = "NEW";
const COPY = "COPY";
const DELETE = "DELETE";

class DataGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleRows: 20, // Начальное количество отображаемых строк
      selectedRow: 0, // Initially row 0 is selected
    };
    this.tableBodyRef = React.createRef();
    this.dataGridRef = React.createRef();
  }

  componentDidMount() {
    this.tableBodyRef.current.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.checkTableHeight);
    document.addEventListener("keydown", this.handleKeyDown);
    this.checkTableHeight();

    this.resizeObserver = new ResizeObserver(this.checkTableHeight);
    this.resizeObserver.observe(this.dataGridRef.current);
  }

  componentWillUnmount() {
    this.tableBodyRef.current.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.checkTableHeight);
    document.removeEventListener("keydown", this.handleKeyDown);
    this.resizeObserver.disconnect();
  }

  checkTableHeight = () => {
    const rowElement = this.tableBodyRef.current.querySelector('tbody tr');
    if (rowElement) {
      const rowHeight = rowElement.offsetHeight;
      const tableHeight = this.dataGridRef.current.clientHeight;
      const toolbarHeight = this.dataGridRef.current.querySelector('.DialogToolBar').offsetHeight;
      const visibleRows = Math.floor((tableHeight - toolbarHeight) / rowHeight);
      if (visibleRows > this.state.visibleRows) {
        this.setState({ visibleRows });
      }
      this.tableBodyRef.current.style.height = `${tableHeight - toolbarHeight}px`;
    }
  };

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
    const dataLength = this.props.metaData.data.length;
    const rowElement = this.tableBodyRef.current.querySelector('tbody tr');
    const rowsPerPage = rowElement ? Math.floor(this.tableBodyRef.current.clientHeight / rowElement.offsetHeight) : 0;
    if (event.key === "ArrowUp" && selectedRow > 0) {
      this.setState({ selectedRow: selectedRow - 1 }, this.scrollToRow);
      event.preventDefault();
    } else if (event.key === "ArrowDown" && selectedRow < dataLength - 1) {
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

  showCrud = (metaData, rowData, mode) => {
    if (typeof this.props.showDialog === 'function') {
      const metaDataCopy = { ...metaData }; // Make a copy of metaData
      delete metaDataCopy.data;
      metaDataCopy.key += mode;
      metaDataCopy.title += ".[" + mode + "]";
      metaDataCopy.hasokbutton = true;
      metaDataCopy.hasCancelButton = true;
      this.props.showDialog(metaDataCopy); // Ensure showDialog is called correctly
    } else {
      console.error('showDialog is not a function');
    }
  };

  handleAction = (action) => {
    const { selectedRow } = this.state;
    const rowData = this.props.metaData.data[selectedRow];

    switch (action.label) {
      case "Exit":
        this.props.onClose();
        break;
      case "New":
        this.showCrud(this.props.metaData, rowData, NEW);
        break;
      case "Copy":
        this.showCrud(this.props.metaData, rowData, COPY);
        break;
      case "Edit":
        this.showCrud(this.props.metaData, rowData, EDIT);
        break;
      case "Delete":
        console.log("Delete action");
        break;
      default:
        console.log(action.label);
    }
  };

  render() {
    const { columns, data, actions } = this.props.metaData;
    const { visibleRows, selectedRow } = this.state;

    // Add separator and Exit action at runtime
    const runtimeActions = [
      { key: "new", label: "New", icon: <MdOutlineCropPortrait /> },
      { key: "copy", label: "Copy", icon: <MdOutlineContentCopy /> },
      { key: "edit", label: "Edit", icon: <MdEdit /> },
      { key: "delete", label: "Delete", icon: <MdClose /> },
      ...actions,
      { key: "separator", label: "/", icon: "" },
      { key: "exit", label: "Exit", icon: <MdOutlineExitToApp /> }
    ];

    return (
      <div ref={this.dataGridRef} style={{ height: '100%' }} _can_grow_height="true" _can_grow_width="true">
        <DialogToolBar actions={runtimeActions} onAction={this.handleAction} />
        <div className="DataGrid" ref={this.tableBodyRef} onScroll={this.handleScroll}>
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
      </div>
    );
  }
}

const DialogToolBar = ({ actions, onAction }) => {
  return (
    <div className="DialogToolBar">
      <div className="dropdown">
        <button className="gridBurgerButton">☰</button>
        <div className="dropdown-content">
          {actions.map((action, index) => (
            action.label !== "/" ? (
              <button key={index} onClick={() => onAction(action)}>
                {action.icon} {action.label}
              </button>
            ) : (
              <hr key={index} />
            )
          ))}
        </div>
      </div>
      {actions.map((action, index) => (
        action.icon && action.label !== "/" && (
          <button key={index} className="gridToolButton" onClick={() => onAction(action)}>
            {action.icon}
          </button>
        )
      ))}
    </div>
  );
};

DataGrid.defaultProps = {
  CanGrowHeight: true,
  CanGrowWidth: true,
};

export default DataGrid;