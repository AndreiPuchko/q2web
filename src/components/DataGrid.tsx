import React, { Component } from "react";
import { MdOutlineExitToApp, MdOutlineCropPortrait, MdOutlineContentCopy, MdEdit, MdClose } from "react-icons/md";
import { Q2Form, Q2Control } from "../q2_modules/Q2Form";
import "./DataGrid.css"
import { showDialog } from '../q2_modules/Q2Api';


const EDIT = "EDIT";
const NEW = "NEW";
const COPY = "COPY";
// const DELETE = "DELETE";

interface DataGridProps {
    q2form: Q2Form;
    onClose: () => void;
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
            this.setState((prevState) => ({ visibleRows: prevState.visibleRows + 10 }));
        }
    };

    handleRowClick = (index: any) => {
        this.setState({ selectedRow: index }, this.scrollToRow);
    };

    handleKeyDown = (event: any) => {
        if (!this.props.isTopDialog) return;
        const { selectedRow, visibleRows } = this.state;
        const dataLength = this.props.q2form.data.length;
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
            this.showCrud(this.props.q2form, EDIT);
            event.preventDefault();
        } else if (event.key === "Insert" && !event.ctrlKey) {
            this.showCrud(this.props.q2form, NEW);
            event.preventDefault();
        } else if (event.key === "Insert" && event.ctrlKey) {
            this.showCrud(this.props.q2form, COPY);
            event.preventDefault();
        } else if (event.key === "Escape" && this.props.onClose) {
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

    showCrud = (q2form: Q2Form, mode: string) => {

        // const q2formCopy = { ...q2form }; // Make a copy of metaData

        const q2formCopy = new Q2Form();
        Object.assign(q2formCopy, q2form);

        q2formCopy.data = [];
        q2formCopy.key += mode;
        q2formCopy.title += ".[" + mode + "]";
        q2formCopy.hasOkButton = true;
        q2formCopy.hasCancelButton = true;

        if (mode === EDIT || mode === COPY) {
            const { selectedRow } = this.state;
            const rowData = this.props.q2form.data[selectedRow];

            q2formCopy.columns.map((column: Q2Control) => (
                column.data = rowData[column.column] || column.data || ""
            ));
        }
        else {
            q2formCopy.columns.map((column: Q2Control) => (
                column.data = ""
            ));
        }
        showDialog(q2formCopy);
    };

    handleAction = (action: any) => {

        switch (action.label) {
            case "Exit":
                if (this.props.onClose) {
                    this.props.onClose();
                }
                break;
            case "New":
                this.showCrud(this.props.q2form, NEW);
                break;
            case "Copy":
                this.showCrud(this.props.q2form, COPY);
                break;
            case "Edit":
                this.showCrud(this.props.q2form, EDIT);
                break;
            case "Delete":
                console.log("Delete action");
                break;
            default:
                console.log(action.label);
        }
    };

    render() {
        const { columns, data, actions } = this.props.q2form;
        const { visibleRows, selectedRow } = this.state;

        // Add separator and Exit action at runtime
        const runtimeActions = [
            { key: "new", label: "New", icon: <MdOutlineCropPortrait /> },
            { key: "copy", label: "Copy", icon: <MdOutlineContentCopy /> },
            { key: "edit", label: "Edit", icon: <MdEdit /> },
            { key: "delete", label: "Delete", icon: <MdClose /> },
            ...actions,
            { key: "separator", label: "-", icon: "" },
            { key: "exit", label: "Exit", icon: <MdOutlineExitToApp /> }
        ];
        // Root contains toolbar and a DataGrid root; the actual scrollable area is .DataGridBody
        return (
            <div ref={this.dataGridRef} className="DataGridRoot" style={{ height: '100%' }}>
                <DialogToolBar actions={runtimeActions} onAction={this.handleAction} />
                <div className="DataGrid">
                    <div className="DataGridBody" ref={this.tableBodyRef} onScroll={this.handleScroll}>
                        <table>
                            <thead className="DataGrigHeader">
                                <tr>
                                    {columns.map((col: any, colIndex: number) => (
                                        <th key={`header-${col.key}-${colIndex}`}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, visibleRows).map((row: any, index: number) => {
                                    const isSelected = selectedRow === index;
                                    const backgroundColor = isSelected ? 'Highlight' : (index % 2 === 1 ? '#e7f7f7' : 'white');
                                    const color = isSelected ? '#FFAA99' : 'black';
                                    return (
                                        <tr
                                            key={`row-${index}`}
                                            onClick={() => this.handleRowClick(index)}
                                            style={{ backgroundColor, color }}
                                        >
                                            {columns.map((col: any, colIndex: number) => (
                                                <td key={`cell-${col.key}-${colIndex}`}>{row[col.column]}</td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
                        action.label !== "-" ? (
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
                action.icon && action.label !== "-" && (
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