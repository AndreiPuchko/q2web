import React, { Component } from "react";
import { MdOutlineExitToApp, MdOutlineCropPortrait, MdOutlineContentCopy, MdEdit, MdClose } from "react-icons/md";
import "./DataGrid.css"

const EDIT = "EDIT";
const NEW = "NEW";
const COPY = "COPY";
// const DELETE = "DELETE";

interface DataGridProps {
  metaData: Record<string, any>;
  onClose: () => void;
  showDialog: (metaData: Record<string, any>, rowData: any) => void;
  isTopDialog: boolean;
}

class DataGrid extends Component<DataGridProps, { visibleRows: number, selectedRow: number }> {
  tableBodyRef = React.createRef<HTMLDivElement>();
  dataGridRef = React.createRef<HTMLDivElement>();
  resizeObserver!: ResizeObserver;
  constructor(props: DataGridProps) {
    super(props);
    this.state = {
      visibleRows: 20, // Начальное количество отображаемых строк
      selectedRow: 0, // Initially row 0 is selected
    };
    this.tableBodyRef = React.createRef();
    this.dataGridRef = React.createRef();
  }

  componentDidMount() {
    this.tableBodyRef.current!.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.checkTableHeight);
    document.addEventListener("keydown", this.handleKeyDown);
    this.checkTableHeight();

    this.resizeObserver = new ResizeObserver(this.checkTableHeight);
    this.resizeObserver.observe(this.dataGridRef.current!);
  }

  componentWillUnmount() {
    this.tableBodyRef.current!.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.checkTableHeight);
    document.removeEventListener("keydown", this.handleKeyDown);
    this.resizeObserver.disconnect();
  }

  checkTableHeight = () => {
    const rowElement = this.tableBodyRef.current!.querySelector('tbody tr') as HTMLTableRowElement;
    if (rowElement) {
      const rowHeight = rowElement.offsetHeight;
      const tableHeight = this.dataGridRef.current!.clientHeight;
      const element = this.dataGridRef.current!.querySelector('.DialogToolBar') as HTMLTableRowElement;
      const toolbarHeight = element.offsetHeight;
      const visibleRows = Math.floor((tableHeight - toolbarHeight) / rowHeight);
      if (visibleRows > this.state.visibleRows) {
        this.setState({ visibleRows });
      }
      this.tableBodyRef.current!.style.height = `${tableHeight - toolbarHeight}px`;
    }
  };

  handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.tableBodyRef.current as HTMLTableRowElement;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.setState((prevState) => ({ visibleRows: prevState.visibleRows + 10 }), this.scrollToRow);
    }
  };

  handleRowClick = (index: any) => {
    this.setState({ selectedRow: index }, this.scrollToRow);
  };

  handleKeyDown = (event: any) => {
    if (!this.props.isTopDialog) return;
    const { selectedRow, visibleRows } = this.state;
    const dataLength = this.props.metaData.data.length;
    const rowElement = this.tableBodyRef.current!.querySelector('tbody tr') as HTMLTableRowElement;
    const rowsPerPage = rowElement ? Math.floor(this.tableBodyRef.current!.clientHeight /
      rowElement.offsetHeight) : 0;

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
    } else if (event.key === " " && selectedRow >= 0 && selectedRow < dataLength) {
      this.showCrud(this.props.metaData, this.props.metaData.data[selectedRow], EDIT);
      event.preventDefault();
    } else if (event.key === "Insert" && !event.ctrlKey) {
      this.showCrud(this.props.metaData, {}, NEW);
      event.preventDefault();
    } else if (event.key === "Insert" && event.ctrlKey) {
      this.showCrud(this.props.metaData, this.props.metaData.data[selectedRow], COPY);
      event.preventDefault();
    } else if (event.key === "Escape") {
      this.props.onClose();
      event.preventDefault();
    }
  };

  scrollToRow = () => {
    const rowElement = this.tableBodyRef.current!.querySelector
      (`tbody tr:nth-child(${this.state.selectedRow + 1})`) as HTMLTableRowElement;
    if (rowElement && this.tableBodyRef.current) {
      const { offsetTop, offsetHeight } = rowElement;
      const { scrollTop, clientHeight } = this.tableBodyRef.current;
      const headerHeight = this.tableBodyRef.current!.querySelector('thead')!.offsetHeight;
      const rowBottom = offsetTop + offsetHeight;
      const viewBottom = scrollTop + clientHeight;
      if (offsetTop < scrollTop + headerHeight || rowBottom > viewBottom) {
        if (offsetTop < scrollTop + headerHeight) {
          this.tableBodyRef.current!.scrollTop = offsetTop - headerHeight;
        } else if (rowBottom > viewBottom) {
          this.tableBodyRef.current!.scrollTop = rowBottom - clientHeight;
        }
      }
    }
  };

  showCrud = (metaData: any, rowData: any, mode: string) => {
    if (typeof this.props.showDialog === 'function') {
      const metaDataCopy = { ...metaData }; // Make a copy of metaData
      delete metaDataCopy.data;
      metaDataCopy.key += mode;
      metaDataCopy.title += ".[" + mode + "]";
      metaDataCopy.hasOkButton = true;
      metaDataCopy.hasCancelButton = true;

      if (mode === EDIT || mode === COPY) {
        metaDataCopy.columns = metaDataCopy.columns.map((column: any) => ({
          ...column,
          value: rowData[column.column] || column.value || ""
        }));
      }

      this.props.showDialog(metaDataCopy, rowData); // Pass rowData for all modes
    } else {
      console.error('showDialog is not a function');
    }
  };

  handleAction = (action: any) => {
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
      <div ref={this.dataGridRef} style={{ height: '100%' }}>
        <DialogToolBar actions={runtimeActions} onAction={this.handleAction} />
        <div className="DataGrid" ref={this.tableBodyRef} onScroll={this.handleScroll}>
          <table>
            <thead className="DataGrigHeader">
              <tr>
                {columns.map((col: any) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, visibleRows).map((row: any, index: number) => (
                <tr
                  key={index}
                  onClick={() => this.handleRowClick(index)}
                  style={{ backgroundColor: selectedRow === index ? 'Highlight' : 'transparent' }}
                >
                  {columns.map((col: any) => (
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

type DialogToolBarProps = {
  actions: string[];
  onAction: (action: string) => void;
};

const DialogToolBar: React.FC<DialogToolBarProps> = ({ actions, onAction }) => {
  return (
    <div className="DialogToolBar">
      <div className="dropdown">
        <button className="gridBurgerButton">☰</button>
        <div className="dropdown-content">
          {actions.map((action: any, index: number) => (
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
      {actions.map((action: any, index: number) => (
        action.icon && action.label !== "/" && (
          <button key={index} className="gridToolButton" onClick={() => onAction(action)}>
            {action.icon}
          </button>
        )
      ))}
    </div>
  );
};

// DataGrid.defaultProps = {
//   CanGrowHeight: true,
//   CanGrowWidth: true,
// };

export default DataGrid;