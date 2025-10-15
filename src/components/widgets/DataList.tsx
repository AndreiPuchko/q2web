import { } from "./DataList.css"
import { Component } from "react";
import { Q2Form, Q2Control } from "../q2_modules/Q2Form";

interface Q2DataListState {
    visibleRows: number,
    selectedRow: number,
    data: Array<any>,
    loading: boolean;
    error: string | null;
}

interface Q2DataListProps {
    q2form: Q2Form;
}

export class Q2DataList extends Component {
    constructor(props) {
        super(props);
        const { columns } = props.q2form;
        this.state = {
            colWidths: columns.map(() => 150),
            columnOrder: columns.map((_, i) => i),
            dragIndex: null
        };
    }

    // ==========================
    // COLUMN RESIZING
    // ==========================
    startResize = (index, e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = this.state.colWidths[index];

        const onMouseMove = (moveEvent) => {
            const delta = moveEvent.clientX - startX;
            this.setState((prev) => {
                const newWidths = [...prev.colWidths];
                newWidths[index] = Math.max(50, startWidth + delta);
                return { colWidths: newWidths };
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // ==========================
    // COLUMN DRAGGING
    // ==========================
    onDragStart = (index, e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
        this.setState({ dragIndex: index });
    };

    onDragOver = (index, e) => {
        e.preventDefault();
        const { dragIndex, columnOrder } = this.state;
        if (dragIndex === index) return;

        const newOrder = [...columnOrder];
        newOrder.splice(
            index,
            0,
            newOrder.splice(dragIndex, 1)[0]
        );

        this.setState({ columnOrder: newOrder, dragIndex: index });
    };

    onDrop = () => {
        this.setState({ dragIndex: null });
    };

    // ==========================
    // RENDER
    // ==========================
    renderHeader() {
        const { columns } = this.props.q2form;
        const { colWidths, columnOrder } = this.state;

        return (
            <div className="Q2DataList-header">
                {columnOrder.map((colIdx, i) => {
                    const column = columns[colIdx];
                    const width = colWidths[colIdx];
                    return (
                        <div
                            key={colIdx}
                            className="Q2DataList-header-cell"
                            style={{
                                flex: `0 0 ${width}px`,
                                width: `${width}px`,
                                boxSizing: "border-box",
                            }}
                            draggable
                            onDragStart={(e) => this.onDragStart(i, e)}
                            onDragOver={(e) => this.onDragOver(i, e)}
                            onDrop={this.onDrop}
                        >
                            <b>{column.label}</b>
                            <div
                                className="Q2DataList-resizer"
                                onMouseDown={(e) => this.startResize(colIdx, e)}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    renderRow(row, rowIndex) {
        const { columns } = this.props.q2form;
        const { colWidths, columnOrder } = this.state;

        return (
            <div key={rowIndex} className="Q2DataList-row">
                {columnOrder.map((colIdx) => {
                    const column = columns[colIdx];
                    const width = colWidths[colIdx];
                    return (
                        <div
                            key={column.column}
                            className="Q2DataList-cell"
                            style={{
                                flex: `0 0 ${width}px`,
                                width: `${width}px`,
                                boxSizing: "border-box",
                            }}
                        >
                            {`${rowIndex} ${row[column.column]}`}
                        </div>
                    );
                })}
            </div>
        );
    }

    render() {
        const { q2form } = this.props;
        return (
            <div className="Q2DataList">
                {this.renderHeader()}
                <div className="Q2DataList-scrollarea">
                    <div>
                        {q2form.data.map((row, index) => this.renderRow(row, index))}
                    </div>
                </div>
            </div>
        );
    }
}

export default Q2DataList;