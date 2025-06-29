import React, { Component } from "react";
import { Q2Report } from "./Q2Report";
import Q2PropsEditor from "./Q2PropsEditor";
import Q2ContentEditor from "./Q2ContentEditor";
import { Q2Form } from "../../q2_modules/Q2Form";
import Form from '../Form';
import "./Q2ReportEditor.css";
import get_report_json from "./test_report"


interface Q2ReportEditorProps {
    zoomWidthPx?: number;
}

type Selection =
    | { type: "report" }
    | { type: "page", pageIdx: number }
    | { type: "column", pageIdx: number, colIdx: number }
    | { type: "colwidth", pageIdx: number, colIdx: number, widthIdx: number }
    | { type: "row", pageIdx: number, colIdx: number, rowSetIdx: number }
    | { type: string, pageIdx: number, colIdx: number, rowSetIdx: number }
    | { type: "rowheight", pageIdx: number, colIdx: number, rowSetIdx: number, heightIdx: number }
    | { type: string, pageIdx: number, colIdx: number, rowSetIdx: number, heightIdx: number }
    | { type: "cell", pageIdx: number, colIdx: number, rowSetIdx: number, rowIdx: number, cellIdx: number }
    | { type: string, pageIdx: number, colIdx: number, rowSetIdx: number, rowIdx: number, cellIdx: number };


interface Q2ReportEditorState {
    selection?: Selection;
    contextMenu?: { x: number; y: number; selection: Selection };
}

class Q2ReportEditor extends Component<Q2ReportEditorProps, Q2ReportEditorState> {
    static defaultProps = {
        zoomWidthPx: 700,
    };

    constructor(props: Q2ReportEditorProps) {
        super(props);
        this.state = {
            selection: { type: "report" },
            contextMenu: undefined,
        };
    }

    // report = get_report_json();
    q2report = new Q2Report(get_report_json());

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
        return { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx };
    }

    handleSelect = (selection: Selection) => {
        this.setState({ selection: selection, contextMenu: undefined });
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
            padding: "3px 18px",
            margin: "2px",
            cursor: "pointer",
            border: 0,
            fontSize: 12,
            borderRadius: "1px",
            width: "9cap"
        };
        const isSelected = this.state.selection?.type === "report";
        return (
            <div>
                <div
                    className="q2-report-header"
                    style={{ background: isSelected ? "#ffe066" : "#f0f0f0" }}
                    onClick={() => this.handleSelect({ type: "report" })}
                    onContextMenu={e => this.handleContextMenu(e, { type: "report" })}
                >
                    <div style={{ width: 161, borderRight: "1px solid #BBB" }}>Report</div>
                    <div style={{ flex: 1, paddingLeft: 16, display: "flex", gap: 12 }}>
                        <button style={buttonStyle}>HTML</button>
                        <button style={buttonStyle}>DOCX</button>
                        <button style={buttonStyle}>XLSX</button>
                        <button style={buttonStyle}>PDF</button>
                    </div>
                </div>
                <Q2ContentEditor selection={this.state.selection} q2report={this.q2report} />
                {this.q2report.getReport().pages.map((page, pageIdx) => (
                    <div key={`page-${pageIdx}`} style={{ marginBottom: 12 }}>
                        {this.RenderPage(page, pageIdx)}
                    </div>
                ))}
            </div>
        );
    }

    RenderPage(page: any, pageIdx: number) {
        const { zoomWidthPx } = this.props;
        const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;
        const pxPerCm = zoomWidthPx / availableWidthCm;
        if (!page.style) {
            page.style = {}
        }

        const isSelected = this.state.selection?.type === "page" && this.state.selection.pageIdx === pageIdx;
        const pageSizes = new Q2Form("", "", "");
        pageSizes.add_control("/h", "")

        // Pass q2report into hookFocusChanged via closure
        const q2report = this.q2report;
        pageSizes.hookFocusChanged = function (form) {
            const dataChunk = {};
            dataChunk[form.prevFocus] = form.s[form.prevFocus];
            q2report.setPageData(pageIdx, dataChunk);
            // console.log(form.prevFocus, dataChunk, q2report)
        }

        pageSizes.add_control("page_width", "W", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_width });
        pageSizes.add_control("page_height", "H", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_height });
        pageSizes.add_control("page_margin_left", "ML", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_left });
        pageSizes.add_control("page_margin_right", "MR", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_right });
        pageSizes.add_control("page_margin_top", "MT", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_top });
        pageSizes.add_control("page_margin_bottom", "MB", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_bottom });

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
                        className="q2-report-page"
                        style={{
                            background: isSelected ? "#ffe066" : "#f9fbe7",
                            minWidth: 161,
                        }}
                    >
                        Page [{pageIdx}]
                    </div>
                    <Form metaData={pageSizes} />
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
                        const { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx } =
                            this.calcColumnsWidths(column, availableWidthCm, pxPerCm);
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
                                {this.renderColumns(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, pageIdx, colIdx)}
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
        pageIdx?: number,
        colIdx?: number,
    ) {
        const isSelected = this.state.selection?.type === "column" &&
            this.state.selection.pageIdx === pageIdx &&
            this.state.selection.colIdx === colIdx;
        if (!column.style) {
            column.style = {};
        }

        // Prepare header, section, footer
        const rowsContent: any[] = [];
        column.rows.forEach((rowSet: any, rowSetIdx: number) => {
            if (rowSet.table_header) {
                rowsContent.push(
                    this.renderRows(
                        column,
                        cellWidthsPx,
                        firstColWidthPx,
                        secondColWidthPx,
                        pageIdx,
                        colIdx,
                        rowSet.table_header,
                        `${rowSetIdx}-header`
                    )
                );
            }
            // Main section
            rowsContent.push(
                this.renderRows(
                    column,
                    cellWidthsPx,
                    firstColWidthPx,
                    secondColWidthPx,
                    pageIdx,
                    colIdx,
                    rowSet,
                    `${rowSetIdx}`
                )
            );
            if (rowSet.table_footer) {
                rowsContent.push(
                    this.renderRows(
                        column,
                        cellWidthsPx,
                        firstColWidthPx,
                        secondColWidthPx,
                        pageIdx,
                        colIdx,
                        rowSet.table_footer,
                        `${rowSetIdx}-footer`
                    )
                );
            }
        });

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
                // onClick={() => this.handleSelect({ type: "column", pageIdx: pageIdx!, colIdx: colIdx! })}
                // onContextMenu={e => this.handleContextMenu(e, { type: "column", pageIdx: pageIdx!, colIdx: colIdx! })}
                >
                    <div
                        className="q2-report-colssection-header"
                        style={{
                            width: `${firstColWidthPx + secondColWidthPx + 1}px`,
                            background: isSelected ? "#ffe066" : "#d0eaff",
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
                                className="q2-report-colssection-widths"
                                key={`colwidth-${colIdx}-${i}`}
                                style={{
                                    width: `${w}px`,
                                    background: isWidthSelected ? "#ffe066" : (isSelected ? "#ffe066" : "#e0eaff"),
                                    borderRight: i < cellWidthsPx.length - 1 ? "1px solid #b0c4de" : "none",
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    this.handleSelect({ type: "colwidth", pageIdx: pageIdx!, colIdx: colIdx!, widthIdx: i });
                                }}
                                onContextMenu={e => {
                                    e.stopPropagation();
                                    this.handleContextMenu(e, { type: "colwidth", pageIdx: pageIdx!, colIdx: colIdx!, widthIdx: i });
                                }}
                            >
                                {column.widths[i]}
                            </div>
                        );
                    })}
                </div>
                {rowsContent}
            </div>
        );
    }

    renderRows(
        column: any,
        cellWidthsPx: number[],
        firstColWidthPx: number,
        secondColWidthPx: number,
        pageIdx?: number,
        colIdx?: number,
        rowSet?: any,
        rowSetIdx?: any
    ) {
        // Only render a single rowSet (not a map)
        const colCount = column.widths.length;

        if (!rowSet) return null;
        const rowCount = rowSet.heights.length || 0;
        const isSelected = this.state.selection?.type === "row"
            && this.state.selection.pageIdx === pageIdx
            && this.state.selection.colIdx === colIdx
            && this.state.selection.rowSetIdx === rowSetIdx;
        const coveredCells = new Set<string>();

        if (!rowSet.cells) return null;

        if (!rowSet.style) {
            rowSet.style = {};
        }
        Object.entries(rowSet.cells).forEach(([key, cell]: [string, any]) => {
            const [rowIdx, cellIdx] = key.split(',').map(Number);
            if (!cell) return;
            const rowspan = cell.rowspan > 1 ? cell.rowspan : 1;
            const colspan = cell.colspan > 1 ? cell.colspan : 1;
            if (rowspan > 1 || colspan > 1) {
                for (let dr = 0; dr < rowspan; dr++) {
                    for (let dc = 0; dc < colspan; dc++) {
                        if (dr !== 0 || dc !== 0) {
                            coveredCells.add(`${rowIdx + dr},${cellIdx + dc}`);
                        }
                    }
                }
            }
        });
        const rowClickParams = { type: "row", pageIdx: pageIdx!, colIdx: colIdx!, rowSetIdx };
        const rowHeights: string[] = [];
        rowSet.heights.forEach(element => {
            const elsplt = element.split("-")
            if (parseFloat(elsplt[1]) !== 0) {
                rowHeights.push(`${elsplt[1]}cm`)
            }
            else {
                rowHeights.push("auto")
            }
        });
        return (
            <div
                key={rowSetIdx}
                className="q2-report-rowssection-body"
                style={{
                    gridTemplateColumns: `${firstColWidthPx}px ${secondColWidthPx}px ${cellWidthsPx.map(w => `${w}px`).join(" ")}`,
                    gridTemplateRows: `${rowHeights.join(" ")}`,
                    borderBottom: rowSetIdx! < column.rows.length - 1 ? "1px solid #EEE" : undefined,
                    background: isSelected ? "#ffe066" : "#EEE"
                }}
            >
                {/* render rows's section "header" column  */}
                <div
                    className="q2-report-rowssection-header"
                    style={{
                        background: isSelected ? "#ffe066" : "#f0f8ff",
                        gridRow: `1 / span ${rowCount}`,
                    }}
                    onClick={e => { e.stopPropagation(); this.handleSelect(rowClickParams); }}
                    onContextMenu={e => { e.stopPropagation(); this.handleContextMenu(e, rowClickParams); }}
                >
                    {rowSet.role}
                </div>
                {/* render rows's heights column */}
                {Array.from({ length: rowCount }).map((_, rowIdx) => {
                    const isHeightSelected = (this.state.selection as any)?.type === "rowheight"
                        && (this.state.selection as any).pageIdx === pageIdx
                        && (this.state.selection as any).colIdx === colIdx
                        && (this.state.selection as any).rowSetIdx === rowSetIdx
                        && (this.state.selection as any).heightIdx === rowIdx;
                    const rowHeightsClickParams = { type: "rowheight", pageIdx: pageIdx!, colIdx: colIdx!, rowSetIdx, heightIdx: rowIdx };
                    return (
                        <div
                            key={`height-${rowSetIdx}-${rowIdx}`}
                            className="q2-report-rowsheights-header"
                            style={{
                                background: isHeightSelected ? "#ffe066" : (isSelected ? "#ffe066" : "#e0f7fa"),
                                gridRow: `${rowIdx + 1} / ${rowIdx + 2}`,
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                this.handleSelect(rowHeightsClickParams);
                            }}
                            onContextMenu={e => {
                                e.stopPropagation();
                                this.handleContextMenu(e, rowHeightsClickParams);
                            }}
                        >
                            {(rowSet.heights && rowSet.heights[rowIdx]) || ""}
                        </div>
                    );
                })}
                {/* render cells */}
                {Array.from({ length: rowCount }).map((_, rowIdx) =>
                    Array.from({ length: colCount }).map((_, cellIdx) => {
                        const cellKey = `${rowIdx},${cellIdx}`;
                        // Exclude covered cells and parent cell (top-left of span)
                        if (coveredCells.has(cellKey)) return null;
                        if (rowSet.cells[cellKey] === undefined) {
                            rowSet.cells[cellKey] = {};
                        }
                        const cell = rowSet.cells && rowSet.cells[cellKey];
                        return this.renderCell(
                            cell,
                            `cell-${rowSetIdx}-${rowIdx}-${cellIdx}`,
                            cellIdx,
                            rowIdx,
                            pageIdx!,
                            colIdx!,
                            rowSetIdx!,
                        );
                    })
                )}
            </div>
        );
    }

    renderCell(
        cell: any,
        cellKey: string,
        cellIdx: number,
        rowIdx: number,
        pageIdx: number,
        colIdx: number,
        rowSetIdx: number,
    ) {
        const clickParams = {
            type: "cell",
            pageIdx: pageIdx!,
            colIdx: colIdx!,
            rowSetIdx,
            rowIdx,
            cellIdx
        };


        if (cell && !cell.style) {
            cell.style = {};
        }

        const isCurrent = this.state.selection?.type === "cell" &&
            this.state.selection.pageIdx === pageIdx &&
            this.state.selection.colIdx === colIdx &&
            this.state.selection.rowSetIdx === rowSetIdx &&
            this.state.selection.rowIdx === rowIdx &&
            this.state.selection.cellIdx === cellIdx;

        // Merge cell.style if present
        const cellStyle: any = {
            backgroundColor: isCurrent ? "#ffe066" : "#fafafa",
            gridColumn: `${cellIdx + 3}`,
            gridRow: `${rowIdx + 1}`,
        };

        if (cell) {
            if (cell.colspan && cell.colspan > 1) {
                cellStyle.gridColumn = cellStyle.gridColumn + ` / span ${cell.colspan}`;
            }
            if (cell.rowspan && cell.rowspan > 1) {
                cellStyle.gridRow = cellStyle.gridRow + ` / span ${cell.rowspan}`;
            }
        }

        const selectedCell = { type: "cell", pageIdx: pageIdx, colIdx: colIdx, rowSetIdx: rowSetIdx, rowIdx: rowIdx, cellIdx: cellIdx };
        const reportCellStyles = this.q2report.getCellStyle(selectedCell);
        const reportCellStyle = { ...reportCellStyles.parentStyle, ...reportCellStyles.style };

        if (cell && cell.style) {
            this.adaptStyle(cellStyle, reportCellStyle);
        }

        return (
            <div
                key={cellKey}
                className="q2-report-cell"
                style={cellStyle}
                onClick={e => { e.stopPropagation(); this.handleSelect(clickParams); }}
                onContextMenu={e => { e.stopPropagation(); this.handleContextMenu(e, clickParams); }}
            >
                {cell && cell.data
                    ? <span dangerouslySetInnerHTML={{ __html: cell.data }} />
                    : ""}
            </div>
        );
    }

    adaptStyle(style: any, reportStyle: any) {
        for (const key in reportStyle) {
            if (key.includes("-")) {
                if (key === "font-size") style["fontSize"] = reportStyle[key]
                else if (key === "font-family") style["fontFamily"] = reportStyle[key]
                else if (key === "font-weight") style["fontWeight"] = reportStyle[key]
                else if (key === "font-italic") style["fontStyle"] = reportStyle[key] != "" ? "italic" : ""
                else if (key === "font-underline") style["fontDecoration"] = reportStyle[key] != "" ? "underline" : ""
                else if (key === "text-align") style["textAlign"] = reportStyle[key]
                else if (key === "vertical-align") style["verticalAlign"] = reportStyle[key]
                else if (key === "border-color") style["borderColor"] = reportStyle[key]
                else if (key === "border-width") {
                    const bw = reportStyle[key].split(" ");
                    if (parseInt(bw[0])) {
                        style["borderTopStyle"] = "solid"
                        style["borderTopWidth"] = `${bw[0]}px`
                    }
                    if (parseInt(bw[1])) {
                        style["borderRightStyle"] = "solid"
                        style["borderRightWidth"] = `${bw[1]}px`
                    }
                    if (parseInt(bw[2])) {
                        style["borderBottomStyle"] = "solid"
                        style["borderBottomWidth"] = `${bw[2]}px`
                    }
                    if (parseInt(bw[3])) {
                        style["borderLeftStyle"] = "solid"
                        style["borderLeftWidth"] = `${bw[3]}px`
                    }
                }
                else console.log(key + " -> " + reportStyle[key]);
            }
            else {
                if (key === "padding") {
                    style["padding"] = reportStyle[key].split(" ")
                        .map(x => x.includes("cm") ? x : `${x}cm`)
                        .join(" ");
                }
            }
        }
    }

    render() {
        return (
            <div className="q2-report-editor-container" >
                <div className="q2-report-editor">
                    {this.renderReport()}
                    {this.renderContextMenu()}
                </div>
                <Q2PropsEditor selection={this.state.selection} q2report={this.q2report} />
            </div>
        );
    }
}

export { Q2ReportEditor };
