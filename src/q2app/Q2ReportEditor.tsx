import React, { Component } from "react";
import Q2PropsEditor from "./Q2PropsEditor";
import "./Q2ReportEditor.css";

interface Q2ReportEditorProps {
    zoomWidthPx?: number;
}

type Selection =
    | { type: "report" }
    | { type: "page", pageIdx: number }
    | { type: "column", pageIdx: number, colIdx: number }
    | { type: "colwidth", pageIdx: number, colIdx: number, widthIdx: number }
    | { type: "row", pageIdx: number, colIdx: number, rowSetIdx: number }
    | { type: "rowheight", pageIdx: number, colIdx: number, rowSetIdx: number, heightIdx: number }
    | { type: "cell", pageIdx: number, colIdx: number, rowSetIdx: number, rowIdx: number, cellIdx: number };

interface Q2ReportEditorState {
    selection?: Selection;
    contextMenu?: { x: number; y: number; selection: Selection };
}

class Q2ReportEditor extends Component<Q2ReportEditorProps, Q2ReportEditorState> {
    static defaultProps = {
        zoomWidthPx: 700,
    };

    state: Q2ReportEditorState = {
        selection: undefined,
        contextMenu: undefined,
    };

    report = {
        pages: [
            {
                page_width: 21.0,
                page_height: 29.0,
                page_margin_left: 2.0,
                page_margin_top: 2.0,
                page_margin_right: 1.0,
                page_margin_bottom: 2.0,
                columns: [
                    {
                        widths: ["20%", "20%", "0.0", "3.00", "3.0"],
                        rows: [{
                            heights: ["0-0", "0-0", "0-0", "0-0.30", "0-0"],
                            cells: {
                                "0,0": { data: "text", style: {} },
                                "3,3": { data: "text3", style: {} },
                            }
                        },
                        {
                            heights: ["0-0", "0-0"],
                            cells: {
                                "0,1": { data: "text", style: {} },
                            }
                        }
                        ]
                    },
                    {
                        widths: ["10", "20%", "0.0", "2.00", "1.0"],
                        rows: [{
                            heights: ["0-0", "0-0", "0-0", "0-0.30", "0-0"],
                            cells: {
                                "1,1": { data: "text", style: {} },
                            }
                        }
                        ]
                    }

                ]
            },
            {
                page_width: 19.0,
                page_height: 29.0,
                page_margin_left: 2.0,
                page_margin_top: 2.0,
                page_margin_right: 1.0,
                page_margin_bottom: 2.0,
                columns: [
                    {
                        widths: ["10%", "20%", "0.0", "3.00", "3.0"],
                        rows: [{
                            heights: ["0-0", "0-0", "0-0", "0-0.30"],
                            cells: {
                                "0,0": { data: "text", style: {} },
                                "3,3": { data: "text3", style: {} },
                            }
                        },
                        {
                            heights: ["0-0", "0-0"],
                            cells: {
                                "0,1": { data: "text", style: {} },
                            }
                        }
                        ]
                    },
                    {
                        widths: ["10", "20%", "0.0", "2.00", "1.0"],
                        rows: [{
                            heights: ["0-0", "0-0"],
                            cells: {
                                "1,1": { data: "text", style: {} },
                            }
                        }
                        ]
                    }

                ]
            }

        ]
    };


    defaultMenu = ["Clone", "Add above", "Add below", "-"];
    reportMenu = ["HTML", "DOCX", "XLSX", "PDF"];
    pageMenu = [...this.defaultMenu];
    columnsMenu = [...this.defaultMenu];
    rowMenu = ["Remove", "Resize"];
    columnMenu = ["Remove", "Resize"];
    rowsMenu = [...this.defaultMenu];
    cellMenu = [...this.defaultMenu];


    private calcColumnsWidths(column: any, availableWidthCm: number, pxPerCm: number) {
        let percentTotal = 0, cmTotal = 0, zeroCount = 0;
        column.widths.forEach((w: string) => {
            if (parseFloat(w) === 0.00) zeroCount++;
            else if (w.includes("%")) percentTotal += isNaN(parseFloat(w)) ? 0 : parseFloat(w);
            else cmTotal += parseFloat(w);
        });
        const pzCm = (availableWidthCm - cmTotal) / 100;
        const zeroCm = availableWidthCm - cmTotal - pzCm * percentTotal;
        const colWidthsCm = column.widths.map((w: string) => parseFloat(w) === 0.00
            ? zeroCm / zeroCount
            : w.endsWith("%")
                ? parseFloat(w) * pzCm
                : parseFloat(w)
        );
        const totalCm = colWidthsCm.reduce((a, b) => a + b, 0);
        const scale = totalCm > 0 ? (this.props.zoomWidthPx! / (totalCm * pxPerCm)) : 1;
        const scaledColWidthsCm = colWidthsCm.map(cm => cm * scale);
        const firstColWidthPx = 80;
        const secondColWidthPx = 80;
        const cellWidthsPx = scaledColWidthsCm.map(cm => cm * pxPerCm);
        const gridWidthPx = cellWidthsPx.reduce((a, b) => a + b, 0);
        const cellHeightPx = 0.5 * pxPerCm;
        return { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx, cellHeightPx };
    }

    handleSelect = (sel: Selection) => {
        this.setState({ selection: sel, contextMenu: undefined });
    };

    handleContextMenu = (e: React.MouseEvent, sel: Selection) => {
        e.preventDefault();
        this.setState({
            selection: sel,
            contextMenu: { x: e.clientX, y: e.clientY, selection: sel }
        });
    };

    handleContextMenuItemClick(command: string) {
        const { contextMenu } = this.state;
        console.log(command, contextMenu?.selection);
    }

    renderContextMenu() {
        const { contextMenu } = this.state;
        if (!contextMenu) return null;

        // Pick menu items based on selection type
        let menuItems: string[] = [];
        const sel = contextMenu.selection;
        if (sel.type === "report") menuItems = this.reportMenu;
        else if (sel.type === "page") menuItems = this.pageMenu;
        else if (sel.type === "column") menuItems = this.columnMenu;
        else if (sel.type === "colwidth") menuItems = this.columnsMenu;
        else if (sel.type === "row") menuItems = this.rowMenu;
        else if (sel.type === "rowheight") menuItems = this.rowsMenu;
        else if (sel.type === "cell") menuItems = this.cellMenu;

        return (
            <div
                className="q2-context-menu"
                style={{
                    top: contextMenu.y,
                    left: contextMenu.x,
                }}
                onClick={() => this.setState({ contextMenu: undefined })}
                onContextMenu={e => e.preventDefault()}
            >
                <div>
                    {menuItems.map((item, idx) =>
                        item === "-" ? (
                            <div key={idx} className="q2-context-menu-separator" />
                        ) : (
                            <div
                                key={idx}
                                className="q2-context-menu-item"
                                onClick={() => { this.handleContextMenuItemClick(item) }}
                                onMouseDown={e => e.stopPropagation()}
                            >
                                {item}
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }

    renderReport() {
        const buttonStyle = {
            padding: "6px 18px",
            fontSize: 12,
            borderRadius: "10px",
            width: "10cap"
        };
        const isSelected = this.state.selection?.type === "report";
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    background: isSelected ? "#ffe066" : "#f0f0f0",
                    borderBottom: "2px solid #888",
                    marginBottom: 2,
                    minHeight: 40,
                    cursor: "pointer",
                }}
                onClick={() => this.handleSelect({ type: "report" })}
                onContextMenu={e => this.handleContextMenu(e, { type: "report" })}
            >
                <div
                    style={{
                        width: 162,
                        fontWeight: "bold",
                        fontSize: 14,
                        color: "#333",
                        textAlign: "center",
                        background: isSelected ? "#ffe066" : "#e0e0e0",
                        padding: "8px 0",
                        borderRight: "1px solid #b0b0b0",
                        boxSizing: "border-box",
                    }}
                >
                    Report
                </div>
                <div style={{ flex: 1, paddingLeft: 16, display: "flex", gap: 12 }}>
                    <button style={buttonStyle}>HTML</button>
                    <button style={buttonStyle}>DOCX</button>
                    <button style={buttonStyle}>XLSX</button>
                    <button style={buttonStyle}>PDF</button>
                </div>
            </div>
        );
    }

    RenderPage(page: any, pageIdx: number) {
        const { zoomWidthPx } = this.props;
        const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;
        const pxPerCm = zoomWidthPx / availableWidthCm;

        // this._currentPageIdx = pageIdx; // set for children
        const isSelected = this.state.selection?.type === "page" && this.state.selection.pageIdx === pageIdx;
        return (
            <div>
                {/* Page info row */}
                <div
                    style={{
                        display: "flex",
                        background: isSelected ? "#ffe066" : "#f9fbe7",
                        borderBottom: "2px solid #888",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => this.handleSelect({ type: "page", pageIdx })}
                    onContextMenu={e => this.handleContextMenu(e, { type: "page", pageIdx })}
                >
                    <div
                        style={{
                            width: 161,
                            padding: "4px 0",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: 13,
                            color: "#444",
                            borderRight: "1px solid #b0c4de",
                            background: isSelected ? "#ffe066" : "#f9fbe7",
                        }}
                    >
                        Page [{pageIdx}]
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "4px 8px",
                            background: isSelected ? "#ffe066" : "#f9fbe7",
                        }}
                    >
                        <label style={{ fontSize: 12, color: "#333" }}>
                            W:
                            <input
                                type="number"
                                value={page.page_width.toFixed(2)}
                                step="0.01"
                                style={{ width: 60, marginLeft: 2, marginRight: 8 }}
                            readOnly
                            />
                        </label>
                        <label style={{ fontSize: 12, color: "#333" }}>
                            H:
                            <input
                                type="number"
                                value={page.page_height.toFixed(2)}
                                step="0.01"
                                style={{ width: 60, marginLeft: 2, marginRight: 8 }}
                            readOnly
                            />
                        </label>
                        <label style={{ fontSize: 12, color: "#333" }}>
                            ML:
                            <input
                                type="number"
                                value={page.page_margin_left.toFixed(2)}
                                step="0.01"
                                style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                            />
                        </label>
                        <label style={{ fontSize: 12, color: "#333" }}>
                            MT:
                            <input
                                type="number"
                                value={page.page_margin_top.toFixed(2)}
                                step="0.01"
                                style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                            />
                        </label>
                        <label style={{ fontSize: 12, color: "#333" }}>
                            MR:
                            <input
                                type="number"
                                value={page.page_margin_right.toFixed(2)}
                                step="0.01"
                                style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                            />
                        </label>
                        <label style={{ fontSize: 12, color: "#333" }}>
                            MB:
                            <input
                                type="number"
                                value={page.page_margin_bottom.toFixed(2)}
                                step="0.01"
                                style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                            />
                        </label>
                    </div>
                </div>
                {/* Columns and rows for each column */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flexWrap: "nowrap",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {page.columns.map((column: any, colIdx: number) => {
                        const { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx, cellHeightPx } =
                            this.calcColumnsWidths(column, availableWidthCm, pxPerCm);
                        // this._currentColIdx = colIdx; // set for children
                        return (
                            <div
                                key={colIdx}
                                style={{
                                    display: "flex",
                                    margin: 0,
                                    background: "#BBB",
                                    border: "1px solid #888",
                                    padding: 0,
                                    width: gridWidthPx + firstColWidthPx + secondColWidthPx,
                                }}
                            >
                                {this.renderColumns(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, cellHeightPx, pageIdx, colIdx)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    renderColumns(
        column: any,
        cellWidthsPx: number[],
        firstColWidthPx: number,
        secondColWidthPx: number,
        cellHeightPx: number,
        pageIdx?: number,
        colIdx?: number
    ) {
        const isSelected = this.state.selection?.type === "column" &&
            this.state.selection.pageIdx === pageIdx &&
            this.state.selection.colIdx === colIdx;
        return (
            <div>
                <div
                    style={{
                        display: "flex",
                        margin: 0,
                        padding: 0,
                        background: isSelected ? "#ffe066" : "#e0eaff",
                        borderBottom: "1px solid #888",
                        cursor: "pointer",
                    }}
                    onClick={() => this.handleSelect({ type: "column", pageIdx: pageIdx!, colIdx: colIdx! })}
                    onContextMenu={e => this.handleContextMenu(e, { type: "column", pageIdx: pageIdx!, colIdx: colIdx! })}
                >
                    <div
                        style={{
                            width: `${firstColWidthPx + secondColWidthPx + 1}px`,
                            textAlign: "center",
                            fontSize: 12,
                            color: "#333",
                            background: isSelected ? "#ffe066" : "#d0eaff",
                            borderRight: "1px solid #b0c4de",
                            padding: "2px 0",
                            boxSizing: "border-box",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            this.handleSelect({ type: "column", pageIdx: pageIdx!, colIdx: colIdx! });
                        }}
                        onContextMenu={e => {
                            e.stopPropagation();
                            this.handleContextMenu(e, { type: "column", pageIdx: pageIdx!, colIdx: colIdx! });
                        }}
                    >
                        Columns
                    </div>
                    {cellWidthsPx.map((w, i) => {
                        const isWidthSelected = (this.state.selection as any)?.type === "colwidth"
                            && (this.state.selection as any).pageIdx === pageIdx
                            && (this.state.selection as any).colIdx === colIdx
                            && (this.state.selection as any).widthIdx === i;
                        return (
                            <div
                                key={i}
                                style={{
                                    width: `${w}px`,
                                    textAlign: "center",
                                    fontSize: 12,
                                    color: "#333",
                                    background: isWidthSelected ? "#ffe066" : (isSelected ? "#ffe066" : "#e0eaff"),
                                    borderRight: i < cellWidthsPx.length - 1 ? "1px solid #b0c4de" : "none",
                                    padding: "2px 0",
                                    boxSizing: "border-box",
                                    cursor: "pointer",
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    this.handleSelect({
                                        type: "colwidth",
                                        pageIdx: pageIdx!,
                                        colIdx: colIdx!,
                                        widthIdx: i
                                    });
                                }}
                                onContextMenu={e => {
                                    e.stopPropagation();
                                    this.handleContextMenu(e, {
                                        type: "colwidth",
                                        pageIdx: pageIdx!,
                                        colIdx: colIdx!,
                                        widthIdx: i
                                    });
                                }}
                            >
                                {column.widths[i]}
                            </div>
                        );
                    })}
                </div>
                {/* Render rows section here */}
                {this.renderRows(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, cellHeightPx, pageIdx, colIdx)}
            </div>
        );
    }

    renderRows(
        column: any,
        cellWidthsPx: number[],
        firstColWidthPx: number,
        secondColWidthPx: number,
        cellHeightPx: number,
        pageIdx?: number,
        colIdx?: number
    ) {
        const colCount = column.widths.length;
        return column.rows.map((rowSet: any, rowSetIdx: number) => {
            const rowCount = rowSet.heights.length || 0;
            const isSelected = this.state.selection?.type === "row"
                && this.state.selection.pageIdx === pageIdx
                && this.state.selection.colIdx === colIdx
                && this.state.selection.rowSetIdx === rowSetIdx;
            return (
                <div
                    key={rowSetIdx}
                    style={{
                        display: "grid",
                        gridTemplateColumns: `${firstColWidthPx}px ${secondColWidthPx}px ${cellWidthsPx.map(w => `${w}px`).join(" ")}`,
                        gridTemplateRows: `repeat(${rowCount}, ${cellHeightPx}px)`,
                        gap: 0,
                        background: isSelected ? "#ffe066" : "#888",
                        margin: 0,
                        padding: 0,
                        borderBottom: rowSetIdx < column.rows.length - 1 ? "2px solid #888" : undefined,
                        cursor: "pointer",
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        this.handleSelect({ type: "row", pageIdx: pageIdx!, colIdx: colIdx!, rowSetIdx });
                    }}
                    onContextMenu={e => {
                        e.stopPropagation();
                        this.handleContextMenu(e, { type: "row", pageIdx: pageIdx!, colIdx: colIdx!, rowSetIdx });
                    }}
                >
                    <div
                        style={{
                            background: isSelected ? "#ffe066" : "#f0f8ff",
                            color: "#333",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            minWidth: 0,
                            minHeight: 0,
                            border: "1px solid #CCC",
                            margin: 0,
                            padding: 0,
                            boxSizing: "border-box",
                            fontWeight: "bold",
                            gridRow: `1 / span ${rowCount}`,
                            gridColumn: "1 / 2",
                            cursor: "pointer",
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            this.handleSelect({ type: "row", pageIdx: pageIdx!, colIdx: colIdx!, rowSetIdx });
                        }}
                        onContextMenu={e => {
                            e.stopPropagation();
                            this.handleContextMenu(e, { type: "row", pageIdx: pageIdx!, colIdx: colIdx!, rowSetIdx });
                        }}
                    >
                        Rows
                    </div>
                    {Array.from({ length: rowCount }).map((_, rowIdx) => {
                        const isHeightSelected = (this.state.selection as any)?.type === "rowheight"
                            && (this.state.selection as any).pageIdx === pageIdx
                            && (this.state.selection as any).colIdx === colIdx
                            && (this.state.selection as any).rowSetIdx === rowSetIdx
                            && (this.state.selection as any).heightIdx === rowIdx;
                        return (
                            <div
                                key={`height-${rowIdx}`}
                                style={{
                                    background: isHeightSelected ? "#ffe066" : (isSelected ? "#ffe066" : "#e0f7fa"),
                                    color: "#333",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    minWidth: 0,
                                    minHeight: 0,
                                    border: "1px solid #CCC",
                                    margin: 0,
                                    padding: 0,
                                    boxSizing: "border-box",
                                    gridColumn: "2 / 3",
                                    gridRow: `${rowIdx + 1} / ${rowIdx + 2}`,
                                    cursor: "pointer",
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    this.handleSelect({
                                        type: "rowheight",
                                        pageIdx: pageIdx!,
                                        colIdx: colIdx!,
                                        rowSetIdx,
                                        heightIdx: rowIdx
                                    });
                                }}
                                onContextMenu={e => {
                                    e.stopPropagation();
                                    this.handleContextMenu(e, {
                                        type: "rowheight",
                                        pageIdx: pageIdx!,
                                        colIdx: colIdx!,
                                        rowSetIdx,
                                        heightIdx: rowIdx
                                    });
                                }}
                            >
                                {(rowSet.heights && rowSet.heights[rowIdx]) || ""}
                            </div>
                        );
                    })}
                    {Array.from({ length: rowCount }).map((_, rowIdx) =>
                        Array.from({ length: colCount }).map((_, cellIdx) => {
                            const cellKey = `${cellIdx},${rowIdx}`;
                            const cell = rowSet.cells && rowSet.cells[cellKey];
                            const isCurrent =
                                this.state.selection?.type === "cell" &&
                                this.state.selection.pageIdx === pageIdx &&
                                this.state.selection.colIdx === colIdx &&
                                this.state.selection.rowSetIdx === rowSetIdx &&
                                this.state.selection.rowIdx === rowIdx &&
                                this.state.selection.cellIdx === cellIdx;
                            return (
                                <div
                                    key={cellKey}
                                    style={{
                                        background: isCurrent ? "#ffe066" : "#fafafa",
                                        color: "black",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        minWidth: 0,
                                        minHeight: 0,
                                        border: "1px solid #CCC",
                                        margin: 0,
                                        padding: 0,
                                        boxSizing: "border-box",
                                        gridColumn: `${cellIdx + 3} / ${cellIdx + 4}`,
                                        gridRow: `${rowIdx + 1} / ${rowIdx + 2}`,
                                        cursor: "pointer",
                                    }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        this.handleSelect({
                                            type: "cell",
                                            pageIdx: pageIdx!,
                                            colIdx: colIdx!,
                                            rowSetIdx,
                                            rowIdx,
                                            cellIdx
                                        });
                                    }}
                                    onContextMenu={e => {
                                        e.stopPropagation();
                                        this.handleContextMenu(e, {
                                            type: "cell",
                                            pageIdx: pageIdx!,
                                            colIdx: colIdx!,
                                            rowSetIdx,
                                            rowIdx,
                                            cellIdx
                                        });
                                    }}
                                >
                                    {cell ? cell.data : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            );
        });
    }

    // Helper to pass pageIdx/colIdx to renderRows/renderColumns
    // private _currentPageIdx: number = 0;
    // private _currentColIdx: number = 0;

    render() {
        return (
            <div className="q2-report-editor-container" >
                <div className="q2-report-editor">
                    {this.renderReport()}
                    {this.report.pages.map((page, pageIdx) => (
                        <div key={pageIdx} style={{ marginBottom: 12 }}>
                            {this.RenderPage(page, pageIdx)}
                        </div>
                    ))}
                    {this.renderContextMenu()}
                </div>
                <Q2PropsEditor />
            </div>
        );
    }
}

export { Q2ReportEditor };
