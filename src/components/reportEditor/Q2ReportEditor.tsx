import React, { Component } from "react";
import { Q2Report } from "./Q2Report";
import { JsonEditor } from 'json-edit-react'
import Q2StyleEditor from "./Q2StyleEditor";
import Q2ContentEditor from "./Q2ContentEditor";
import "./Q2ReportEditor.css";
import Q2Button from "../widgets/Button";
import { Q2Control, Q2Form } from "../../q2_modules/Q2Form"
import { showDialog } from '../../q2_modules/Q2DialogApi';
import uploadAndDownload from "./Q2ReportAPI"


interface Q2ReportEditorProps {
    zoomWidthPx?: number;
    q2report: any;
    data_set: any;
}

function stableStringify(obj: any) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}


function darkenColor(baseColor: string, index: number) {
    if (!/^#?[0-9a-fA-F]{6}$/.test(baseColor)) {
        throw new Error("Invalid color format. Use #RRGGBB.");
    }

    const factor = 1 - (index * 0.09); // 0.92 для index=1, 0.2 для index=10
    const hex = baseColor.startsWith('#') ? baseColor.slice(1) : baseColor;

    const r = Math.max(0, Math.floor(parseInt(hex.slice(0, 2), 16) * factor));
    const g = Math.max(0, Math.floor(parseInt(hex.slice(2, 4), 16) * factor));
    const b = Math.max(0, Math.floor(parseInt(hex.slice(4, 6), 16) * factor));

    const toHex = (v: any) => v.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export type CellSelection = { type: "none" } |
{
    type: "cell",
    pageIdx: number,
    columnSetIdx: number,
    rowSetIdx: number,
    rowIdx: number,
    columnIdx: number
}
type RowSetSelection = { type: "row", pageIdx: number, columnSetIdx: number, rowSetIdx: number }

export type Selection =
    | { type: "report" }
    | { type: "page", pageIdx: number }
    | { type: "column", pageIdx: number, columnSetIdx: number }
    | { type: "colwidth", pageIdx: number, columnSetIdx: number, widthIdx: number }
    | RowSetSelection
    | { type: "rowheight", pageIdx: number, columnSetIdx: number, rowSetIdx: number, heightIdx: number }
    | CellSelection

const firstColWidthPx = 80;
const secondColWidthPx = 55;
const selectionColor = "#ffe066";

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
    q2report = new Q2Report({ ...this.props.q2report });
    data_set = this.props.data_set;

    defaultMenu = ["Clone", "Add above", "Add below", "-", "Hide", "Show", "Move Up", "Move Down", "-", "❌Remove"];

    reportMenu = ["HTML", "DOCX", "XLSX", "PDF"];
    pageMenu = [...this.defaultMenu];
    columnsSectionMenu = [...this.defaultMenu];
    columnMenu = ["Clone", "Add left", "Add right", "-", "Move Left", "Move Right", "-", "❌Remove"];
    rowsSectionMenu = ["Clone", "Add above", "Add below", "-", "Move Up", "Move Down", "-", "❌Remove"];
    rowMenu = ["Clone", "Add above", "Add below", "-", "Move Up", "Move Down", "-", "❌Remove"];

    handleSelect = (selection: Selection) => {
        if (selection.type !== "cell") this.reportViewRef.current?.clearSelection()
        this.setState({ selection: selection, contextMenu: undefined });
    };

    handleContextMenu = (e: React.MouseEvent, selection: Selection) => {
        if (selection.type !== "cell")
            this.reportViewRef.current?.clearSelection()
        else {
            if (!this.reportViewRef.current?.isCellSelected(selection)) {
                this.reportViewRef.current?.clearSelection()
                this.reportViewRef.current?.setState({ selStart: selection, selEnd: selection }, () => {
                    e.preventDefault();
                    this.setState({
                        selection: selection,
                        contextMenu: { x: e.clientX, y: e.clientY, selection: selection }
                    });
                })
                return
            }
        }
        e.preventDefault();
        this.setState({
            selection: selection,
            contextMenu: { x: e.clientX, y: e.clientY, selection: selection }
        });
    };

    handleContextMenuItemClick(command: string) {
        const { contextMenu, selection } = this.state;
        if (!selection) return;
        if (contextMenu === undefined) return;
        const nextState: Q2ReportEditorState = { contextMenu: undefined };
        this.setState(nextState);
        if (command === "Clone") {
            this.q2report.addObjectAboveBelow(selection, "above", true)
        } else if (command === "❌Remove") {
            const sel = contextMenu.selection;
            this.q2report.removeObject(sel)
            nextState.selection = { type: "report" };
        } else if (command.startsWith("Add table header")) {
            this.q2report.addTableHeaderFooter(contextMenu.selection, "table_header")
            nextState.selection = { type: "report" };
        } else if (command.startsWith("Add table footer")) {
            this.q2report.addTableHeaderFooter(contextMenu.selection, "table_footer")
            nextState.selection = { type: "report" };
        } else if (command.startsWith("Add table grouping")) {
            this.q2report.addTableGrouping(contextMenu.selection)
            nextState.selection = { type: "report" };
        } else if (command.startsWith("Add")) {
            const position = (command === "Add above" || command === "Add left") ? "above" : "below";
            this.q2report.addObjectAboveBelow(contextMenu.selection, position)
            nextState.selection = { type: "report" };
        } else if (command.startsWith("Move")) {
            const direction = (command === "Move Up" || command === "Move Left") ? "up" : "down";
            const newSelection = this.q2report.moveObject(contextMenu.selection, direction);
            nextState.selection = newSelection || this.state.selection;
        } else if ((command === "Hide" || command === "Show")) {
            this.q2report.toggleHideShow(contextMenu.selection);
        } else if (command === "Unmerge cells") {
            this.q2report.unmergeCell(selection);
            nextState.selection = selection;
        } else if (command === "Merge cells" && this.reportViewRef.current?.state !== undefined) {
            const { selStart, selEnd } = this.reportViewRef.current.state;
            this.q2report.mergeSelectedCells({ selStart, selEnd });
            nextState.selection = selection;
        }
        this.setState(nextState, () => this.incrementVersion());
        console.log(command, contextMenu?.selection === selection);
    }

    renderContextMenu() {
        const { contextMenu } = this.state;
        if (!contextMenu) return null;

        // Pick menu items based on selection type
        let filteredMenuItems: string[] = [];
        const sel = contextMenu.selection;

        if (sel.type === "report")
            filteredMenuItems = this.reportMenu
        else if (sel.type === "page") {
            const count = this.q2report.pages.length;
            const idx = sel.pageIdx;
            const page = this.q2report.getPage(sel);
            filteredMenuItems = this.pageMenu.filter(item =>
                (item !== "Show" || page.hidden) &&
                (item !== "Hide" || !page.hidden) &&
                (item !== "Move Up" || idx > 0) &&
                (item !== "Move Down" || idx < count - 1) &&
                (count > 1 || (item !== "Move Up" && item !== "Move Down"))
            );
        } else if (sel.type === "column") {
            const page = this.q2report.getPage(sel);
            const col = this.q2report.getColsSet(sel);
            const count = page?.columns?.length ?? 0;
            const idx = sel.columnSetIdx;
            filteredMenuItems = this.columnsSectionMenu.filter(item =>
                (item !== "Show" || col.hidden) &&
                (item !== "Hide" || !col.hidden) &&
                (item !== "Move Up" || idx > 0) &&
                (item !== "Move Down" || idx < count - 1) &&
                (count > 1 || (item !== "Move Up" && item !== "Move Down"))
            );
        } else if (sel.type === "colwidth") {
            const col = this.q2report.getColsSet(sel);
            const count = col?.widths.length ?? 0;
            filteredMenuItems = this.columnMenu.filter(item =>
                (item !== "Move Left" || sel.widthIdx > 0) &&
                (item !== "Move Right" || sel.widthIdx < count - 1)
            );
        } else if (sel.type === "row") {
            const columns = this.q2report.getColsSet(sel);
            const count = columns?.rows?.length ?? 0;
            let idx: number = 0;
            if (typeof sel.rowSetIdx === "string") {
                const tmp: string = sel.rowSetIdx;
                idx = parseInt(tmp.replace("-header", "").replace("-footer", ""));
            }
            else {
                idx = sel.rowSetIdx;
            }
            filteredMenuItems = this.rowsSectionMenu.filter(item =>
                (item !== "Move Up" || idx > 0) &&
                (item !== "Move Down" || idx < count - 1) &&
                (count > 1 || (item !== "Move Up" && item !== "Move Down"))
            );
            const rowSet = this.q2report.getRowsSet(sel)
            if (rowSet.role === "table") {
                filteredMenuItems.push("-")
                if (!rowSet.table_header || Object.keys(rowSet.table_header).length === 0) filteredMenuItems.push("Add table header")
                if (!rowSet.table_footer || Object.keys(rowSet.table_footer).length === 0) filteredMenuItems.push("Add table footer")
                filteredMenuItems.push("Add table grouping")
            }
        } else if (sel.type === "rowheight") {
            const rowsSet = this.q2report.getRowsSet(sel);
            const count = rowsSet?.heights?.length ?? 0;
            filteredMenuItems = this.rowMenu.filter(item =>
                (item !== "Move Up" || sel.heightIdx > 0) &&
                (item !== "Move Down" || sel.heightIdx < count - 1)
            );
        } else if (sel?.type === "cell") {
            const cell = this.q2report.getCell(sel)
            filteredMenuItems = []
            if (this.state.selection !== undefined &&
                this.state.selection.type === "cell" &&
                this.reportViewRef.current?.isCellSelected(this.state.selection) &&
                (stableStringify(this.reportViewRef.current?.state.selStart) !==
                    stableStringify(this.reportViewRef.current?.state.selEnd)))
                filteredMenuItems.push("Merge cells");
            if ((cell.colspan > 1 || cell.rowspan > 1)) {
                if (filteredMenuItems.length !== 0) filteredMenuItems.push("-");
                filteredMenuItems.push("Unmerge cells");
            }
            if (filteredMenuItems.length === 0) return ""
        }
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
                    {filteredMenuItems.map((item, idx) =>
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

    incrementVersion() {
        if (this.reportViewRef && this.reportViewRef.current) {
            this.reportViewRef.current.incrementVersion();
        }
    }

    reportViewRef = React.createRef<ReportView>();

    render() {
        return (
            <div className="q2-report-editor-root">
                <Q2ContentEditor selection={this.state.selection} q2report={this.q2report} reportEditor={this} />
                <div className="q2-report-editor-container" >
                    <div className="q2-report-editor scrollable">
                        <ReportView
                            ref={this.reportViewRef}
                            selection={this.state.selection}
                            q2report={this.q2report}
                            handleSelect={this.handleSelect}
                            handleContextMenu={this.handleContextMenu}
                            zoomWidthPx={this.props.zoomWidthPx}
                            reportEditor={this}
                        />
                        {this.renderContextMenu()}
                    </div>
                    <Q2StyleEditor selection={this.state.selection} q2report={this.q2report} reportEditor={this} />
                </div>
            </div>
        );
    }
}

class ReportView extends React.Component<any, {
    version: number,
    selStart: CellSelection,
    selEnd: CellSelection,
    selList: Set<string>,
    isDragging: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = { version: 0, selStart: { type: "none" }, selEnd: { type: "none" }, isDragging: false, selList: new Set() };
    }

    componentDidMount() {
        window.addEventListener("mouseup", this.handleGlobalMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener("mouseup", this.handleGlobalMouseUp);
    }

    handleGlobalMouseUp = () => {
        // console.log(this.state)
        this.setState({ isDragging: false });
    };

    clearSelection() {
        this.setState({ selStart: { type: "none" }, selEnd: { type: "none" }, isDragging: false, selList: new Set() })
    }

    incrementVersion = () => {
        this.setState(state => ({ version: state.version + 1 }));
    };

    calcColumnsWidths(column: any, availableWidthCm: number, pxPerCm: number) {
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
        const totalCm = colWidthsCm.reduce((a: number, b: number) => a + b, 0);
        const scale = totalCm > 0 ? (this.props.zoomWidthPx! / (totalCm * pxPerCm)) : 1;
        const scaledColWidthsCm = colWidthsCm.map((cm: number) => cm * scale);
        const cellWidthsPx = scaledColWidthsCm.map((cm: number) => cm * pxPerCm);
        const gridWidthPx = cellWidthsPx.reduce((a: number, b: number) => a + b, 0);
        return { gridWidthPx, cellWidthsPx };
    }

    RenderPage(page: any, pageIdx: number) {
        const { selection, handleSelect, handleContextMenu, zoomWidthPx } = this.props;
        const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;
        const pxPerCm = zoomWidthPx / availableWidthCm;
        if (!page.style) {
            page.style = {}
        }

        const isSelected = selection?.type === "page" && selection.pageIdx === pageIdx;
        // Add hidden indication
        const isHidden = !!page.hidden;
        return (
            <div style={isHidden ? {} : {}}>
                <div
                    style={{
                        display: "flex",
                        background: isSelected ? selectionColor : "#f9fbe7",
                        borderBottom: "2px solid #888",
                        alignItems: "center",
                        minWidth: firstColWidthPx + secondColWidthPx + zoomWidthPx,
                        cursor: "pointer",
                        filter: isHidden ? "grayscale(0.5)" : undefined
                    }}
                    onClick={() => handleSelect({ type: "page", pageIdx })}
                    onContextMenu={e => handleContextMenu(e, { type: "page", pageIdx })}
                >
                    <div
                        className="q2-report-page"
                        style={{
                            background: isSelected ? selectionColor : "#f9fbe7",
                            textDecoration: isHidden ? "line-through" : undefined,
                            minWidth: firstColWidthPx + secondColWidthPx + 1,
                            color: isHidden ? "#888" : undefined
                        }}
                    >
                        Page [{pageIdx}]{isHidden ? " (hidden)" : ""}
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flexWrap: "nowrap",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {page.columns.map((column: any, columnSetIdx: number) => {
                        // If page is hidden, columns are visually hidden (height: 0), but page itself is shown with (hidden) mark
                        if (isHidden) {
                            return (
                                <div key={columnSetIdx} style={{ height: 0, overflow: "hidden" }}>
                                    {this.renderColumns(column, [], pageIdx, columnSetIdx)}
                                </div>
                            );
                        }
                        if (column.hidden) {
                            return (
                                <div key={columnSetIdx}>
                                    {this.renderColumns(column, [], pageIdx, columnSetIdx, true)}
                                </div>
                            );
                        }
                        const { gridWidthPx, cellWidthsPx } =
                            this.calcColumnsWidths(column, availableWidthCm, pxPerCm);
                        return (
                            <div
                                key={columnSetIdx}
                                style={{
                                    display: "flex",
                                    margin: 0,
                                    background: "#BBB",
                                    border: "1px solid #888",
                                    padding: 0,
                                    width: gridWidthPx + firstColWidthPx + secondColWidthPx,
                                }}
                            >
                                {this.renderColumns(column, cellWidthsPx, pageIdx, columnSetIdx)}
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
        pageIdx?: number,
        columnSetIdx?: number,
        forceAllRowsHidden?: boolean
    ) {
        const isSelected = this.props.selection?.type === "column" &&
            this.props.selection.pageIdx === pageIdx &&
            this.props.selection.columnSetIdx === columnSetIdx;
        const isHidden = !!column.hidden || !!forceAllRowsHidden;
        if (!column.style) {
            column.style = {};
        }

        // Prepare header, section, footer
        const rowsContent: any[] = [];
        column.rows.forEach((rowSet: any, rowSetIdx: number) => {
            if (isHidden) {
                rowsContent.push(
                    <div key={rowSetIdx} style={{ height: 0, overflow: "hidden" }}>
                        {this.renderRows(column, cellWidthsPx, pageIdx, columnSetIdx, rowSet, rowSetIdx, true)}
                    </div>
                );
                return;
            }
            if (rowSet.hidden) {
                rowsContent.push(
                    <div key={rowSetIdx} style={{ height: 0, overflow: "hidden" }}>
                        {this.renderRows(column, cellWidthsPx, pageIdx, columnSetIdx, rowSet, rowSetIdx)}
                    </div>
                );
                return;
            }
            if (rowSet.table_header) {
                rowsContent.push(
                    this.renderRows(
                        column,
                        cellWidthsPx,
                        pageIdx,
                        columnSetIdx,
                        rowSet.table_header,
                        `${rowSetIdx}-header`
                    )
                );
            }
            // Grouping - header
            if (rowSet?.table_groups.length > 0) {
                rowSet?.table_groups.forEach((grp: any, index: number) => {
                    rowsContent.push(
                        this.renderRows(
                            column,
                            cellWidthsPx,
                            pageIdx,
                            columnSetIdx,
                            grp.group_header,
                            `${rowSetIdx}-group-header-${index}`
                        )
                    );
                })
            }
            // Main section
            rowsContent.push(
                this.renderRows(
                    column,
                    cellWidthsPx,
                    pageIdx,
                    columnSetIdx,
                    rowSet,
                    `${rowSetIdx}`
                )
            );
            // Grouping - header
            if (rowSet?.table_groups.length > 0) {
                for (let index = rowSet.table_groups.length - 1; index >= 0; index--) {
                    rowsContent.push(
                        this.renderRows(
                            column,
                            cellWidthsPx,
                            pageIdx,
                            columnSetIdx,
                            rowSet.table_groups[index].group_footer,
                            `${rowSetIdx}-group-footer-${index}`
                        )
                    )
                }
            }

            if (rowSet.table_footer) {
                rowsContent.push(
                    this.renderRows(
                        column,
                        cellWidthsPx,
                        pageIdx,
                        columnSetIdx,
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
                        background: isSelected ? selectionColor : "#d0eaff",
                        borderBottom: "1px solid #888",
                        cursor: "pointer",
                        filter: isHidden ? "grayscale(0.7)" : undefined
                    }}
                    onClick={() => this.props.handleSelect({ type: "column", pageIdx: pageIdx!, columnSetIdx: columnSetIdx! })}
                    onContextMenu={e => this.props.handleContextMenu(e, { type: "column", pageIdx: pageIdx!, columnSetIdx: columnSetIdx! })}
                >
                    <div
                        className="q2-report-colssection-header"
                        style={{
                            width: `${firstColWidthPx + secondColWidthPx + 1}px`,
                            background: isSelected ? selectionColor : "#d0eaff",
                            textDecoration: isHidden ? "line-through" : undefined,
                            color: isHidden ? "#888" : undefined
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            this.props.handleSelect({ type: "column", pageIdx: pageIdx!, columnSetIdx: columnSetIdx! });
                        }}
                        onContextMenu={e => {
                            e.stopPropagation();
                            this.props.handleContextMenu(e, { type: "column", pageIdx: pageIdx!, columnSetIdx: columnSetIdx! });
                        }}
                    >
                        Columns{isHidden ? " (hidden)" : ""}
                    </div>
                    {/* Always render widths, even if hidden */}
                    {cellWidthsPx.map((w, i) => {
                        const isWidthSelected = (this.props.selection as any)?.type === "colwidth"
                            && (this.props.selection as any).pageIdx === pageIdx
                            && (this.props.selection as any).columnSetIdx === columnSetIdx
                            && (this.props.selection as any).widthIdx === i;
                        return (
                            <div
                                className="q2-report-colssection-widths"
                                key={`colwidth-${columnSetIdx}-${i}`}
                                style={{
                                    width: `${w}px`,
                                    background: isWidthSelected ? selectionColor : (isSelected ? selectionColor : "#e0eaff"),
                                    borderRight: i < cellWidthsPx.length - 1 ? "1px solid #b0c4de" : "none",
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    this.props.handleSelect({ type: "colwidth", pageIdx: pageIdx!, columnSetIdx: columnSetIdx!, widthIdx: i });
                                }}
                                onContextMenu={e => {
                                    e.stopPropagation();
                                    this.props.handleContextMenu(e, { type: "colwidth", pageIdx: pageIdx!, columnSetIdx: columnSetIdx!, widthIdx: i });
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
        pageIdx?: number,
        columnSetIdx?: number,
        rowSet?: any,
        rowSetIdx?: any,
        forceHidden?: boolean
    ) {
        // Only render a single rowSet (not a map)
        const colCount = column.widths.length;

        if (!rowSet) return null;
        const rowCount = rowSet.heights?.length || 0;
        if (rowCount === 0) return;
        const isSelected = this.props.selection?.type === "row"
            && this.props.selection.pageIdx === pageIdx
            && this.props.selection.columnSetIdx === columnSetIdx
            && this.props.selection.rowSetIdx === rowSetIdx;
        const isHidden = !!rowSet?.hidden || !!forceHidden;
        const coveredCells = new Set<string>();

        if (!rowSet.cells) return null;

        if (!rowSet.style) {
            rowSet.style = {};
        }
        Object.entries(rowSet.cells).forEach(([key, cell]: [string, any]) => {
            const [rowIdx, columnIdx] = key.split(',').map(Number);
            if (!cell) return;
            const rowspan = cell.rowspan > 1 ? cell.rowspan : 1;
            const colspan = cell.colspan > 1 ? cell.colspan : 1;
            if (rowspan > 1 || colspan > 1) {
                for (let dr = 0; dr < rowspan; dr++) {
                    for (let dc = 0; dc < colspan; dc++) {
                        if (dr !== 0 || dc !== 0) {
                            coveredCells.add(`${rowIdx + dr},${columnIdx + dc}`);
                        }
                    }
                }
            }
        });
        const rowClickParams = { type: "row", pageIdx: pageIdx!, columnSetIdx: columnSetIdx!, rowSetIdx };
        const rowHeights: string[] = [];
        rowSet.heights.forEach((element: string) => {
            const elsplt = element.split("-")
            if (parseFloat(elsplt[0]) !== 0) {
                rowHeights.push(`${elsplt[0]}cm`)
            }
            else if (parseFloat(elsplt[1]) !== 0) {
                rowHeights.push(`${elsplt[1]}cm`)
            }
            else {
                rowHeights.push("auto")
            }
        });
        let bgColor = rowSet.role === "table" ? "#AAFFDD" : "#f0f8ff";
        if (rowSet.role.includes("group")) {
            const grpIdx = parseInt(rowSetIdx.split("-")[3])
            bgColor = darkenColor("#EEFFBB", grpIdx);
        }
        if (isSelected) bgColor = selectionColor;
        return (
            <div
                key={rowSetIdx}
                className="q2-report-rowssection-body"
                style={{
                    gridTemplateColumns: `${firstColWidthPx}px ${secondColWidthPx}px ${cellWidthsPx.map(w => `${w}px`).join(" ")}`,
                    gridTemplateRows: `${rowHeights.join(" ")}`,
                    borderBottom: rowSetIdx! < column.rows.length - 1 ? "1px solid #EEE" : undefined,
                    height: isHidden ? 0 : undefined,
                    overflow: isHidden ? "hidden" : undefined,
                    background: isSelected ? selectionColor : "#EEE",
                    opacity: isHidden ? 0.5 : 1,
                    filter: isHidden ? "grayscale(0.7)" : undefined
                }}
            >
                {/* render rows's section "header" column  */}
                <div
                    className="q2-report-rowssection-header"
                    style={{
                        background: bgColor,
                        gridRow: `1 / span ${rowCount}`,
                        textDecoration: isHidden ? "line-through" : undefined,
                        color: isHidden ? "#888" : undefined,
                    }}
                    onClick={e => { e.stopPropagation(); this.props.handleSelect(rowClickParams); }}
                    onContextMenu={e => { e.stopPropagation(); this.props.handleContextMenu(e, rowClickParams); }}
                >
                    {rowSet.role.includes("group") ? rowSet.role.replace("group_", "g-") : rowSet.role}
                    {rowSet.role.includes("group") ? <div style={{ fontWeight: "normal" }}>/{rowSet.groupby}/</div> : ""}
                    {rowSet.role === "table" ? <div style={{ fontWeight: "normal" }}>[{rowSet.data_source}]</div> : ""}
                    {isHidden ? " (hidden)" : ""}
                </div>
                {/* render rows's heights column */}
                {Array.from({ length: rowCount }).map((_, rowIdx) => {
                    const isHeightSelected = (this.props.selection as any)?.type === "rowheight"
                        && (this.props.selection as any).pageIdx === pageIdx
                        && (this.props.selection as any).columnSetIdx === columnSetIdx
                        && (this.props.selection as any).rowSetIdx === rowSetIdx
                        && (this.props.selection as any).heightIdx === rowIdx;
                    const rowHeightsClickParams = { type: "rowheight", pageIdx: pageIdx!, columnSetIdx: columnSetIdx!, rowSetIdx, heightIdx: rowIdx };
                    return (
                        <div
                            key={`height-${rowSetIdx}-${rowIdx}`}
                            className="q2-report-rowsheights-header"
                            style={{
                                background: isHeightSelected ? selectionColor : (isSelected ? selectionColor : "#e0f7fa"),
                                gridRow: `${rowIdx + 1} / ${rowIdx + 2}`,
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                this.props.handleSelect(rowHeightsClickParams);
                            }}
                            onContextMenu={e => {
                                e.stopPropagation();
                                this.props.handleContextMenu(e, rowHeightsClickParams);
                            }}
                        >
                            {(rowSet.heights && rowSet.heights[rowIdx]) || ""}
                        </div>
                    );
                })}
                {/* render cells */}
                {Array.from({ length: rowCount }).map((_, rowIdx) =>
                    Array.from({ length: colCount }).map((_, columnIdx) => {
                        const cellKey = `${rowIdx},${columnIdx}`;
                        // Exclude covered cells and parent cell (top-left of span)
                        if (coveredCells.has(cellKey)) return null;
                        if (rowSet.cells[cellKey] === undefined) {
                            rowSet.cells[cellKey] = {};
                        }
                        const cell = rowSet.cells && rowSet.cells[cellKey];
                        return this.renderCell(
                            cell,
                            `cell-${rowSetIdx}-${rowIdx}-${columnIdx}`,
                            columnIdx,
                            rowIdx,
                            pageIdx!,
                            columnSetIdx!,
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
        columnIdx: number,
        rowIdx: number,
        pageIdx: number,
        columnSetIdx: number,
        rowSetIdx: number,
    ) {
        const clickParams: CellSelection = {
            type: "cell",
            pageIdx: pageIdx!,
            columnSetIdx: columnSetIdx!,
            rowSetIdx,
            rowIdx,
            columnIdx
        };

        if (cell && !cell.style) {
            cell.style = {};
        }

        // Merge cell.style if present
        const cellStyle: any = {
            background: "#ffffff",
            gridColumn: `${columnIdx + 3}`,
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

        const isCurrent = this.props.selection?.type === "cell" &&
            this.props.selection.pageIdx === pageIdx &&
            this.props.selection.columnSetIdx === columnSetIdx &&
            this.props.selection.rowSetIdx === rowSetIdx &&
            this.props.selection.rowIdx === rowIdx &&
            this.props.selection.columnIdx === columnIdx;

        const selectedCell = { type: "cell", pageIdx: pageIdx, columnSetIdx: columnSetIdx, rowSetIdx: rowSetIdx, rowIdx: rowIdx, columnIdx: columnIdx };
        const reportCellStyles = this.props.q2report.getCellStyle(selectedCell);
        const reportCellStyle = { ...reportCellStyles.parentStyle, ...reportCellStyles.style };

        if (cell && cell.style) {
            this.adaptStyle(cellStyle, reportCellStyle);
        }


        if (isCurrent) {
            cellStyle.outline = "2px solid lightgreen"
            cellStyle.outlineOffset = "-2px"
        }
        else {
            // cellStyle.background = `${cellStyle.background}`;
        }
        if (this.isCellSelected(clickParams) || this.state.selList.has(stableStringify(clickParams))) {
            // console.log(cellStyle.background, typeof cellStyle.background)
            if (["white", "#ffffff"].includes(cellStyle.background)) {
                cellStyle.background = selectionColor
            }
            else {
                cellStyle.boxShadow = `0.5cap 0.5cap 0.5cap ${selectionColor} inset, -0.5cap  -0.5cap 0.5cap ${selectionColor} inset`;
            }
        }


        return (
            <div
                key={cellKey}
                className="q2-report-cell"
                style={cellStyle}
                // onClick={(e) => { e.stopPropagation(); this.props.handleSelect(clickParams); }}
                onContextMenu={e => { e.stopPropagation(); this.props.handleContextMenu(e, clickParams); }}
                onMouseDown={(e) => this.cellMouseDown(e, clickParams)}
                onMouseEnter={(e) => this.cellMouseEnter(e, clickParams)}
            >
                {cell && cell.data
                    ? <span dangerouslySetInnerHTML={{ __html: cell.data }} />
                    : ""}
            </div>
        );
    }

    cellMouseDown(event: React.MouseEvent, selection: CellSelection) {
        if (event?.button === 2) return
        this.props.handleSelect(selection)
        const isMulti = event?.ctrlKey || event?.metaKey;

        this.setState((prevState) => {
            // keep or reset
            const newList = new Set(isMulti ? prevState.selList : []);
            const strSel = stableStringify(selection);
            if (newList.has(strSel))
                newList.delete(strSel)
            else
                newList.add(stableStringify(selection));
            const selStart = isMulti ? prevState.selStart : selection;
            const selEnd = isMulti ? prevState.selEnd : selection;

            return {
                selStart: selStart,
                selEnd: selEnd,
                selList: newList,
                isDragging: true
            }
        })
    }

    cellMouseEnter(event: React.MouseEvent, sel: CellSelection) {
        if (event?.button !== 0) return
        if (this.state.selStart.type === "none" || sel.type === "none") return;
        if (
            this.state.selStart.pageIdx !== sel.pageIdx ||
            this.state.selStart.columnSetIdx !== sel.columnSetIdx ||
            this.state.selStart.rowSetIdx !== sel.rowSetIdx
        ) return
        if (this.state.isDragging) {
            this.setState({ selEnd: sel });
        }
    }

    adaptStyle(style: any, reportStyle: any) {
        style["display"] = "flex"
        for (const key in reportStyle) {
            if (key.includes("-")) {
                if (key === "font-size") style["fontSize"] = reportStyle[key]
                else if (key === "font-family") style["fontFamily"] = reportStyle[key]
                else if (key === "font-weight") style["fontWeight"] = reportStyle[key]
                else if (key === "font-italic") style["fontStyle"] = reportStyle[key] != "" ? "italic" : ""
                else if (key === "font-underline") style["fontDecoration"] = reportStyle[key] != "" ? "underline" : ""
                else if (key === "text-align") {
                    style["justifyContent"] = reportStyle[key]
                    style["textAlign"] = reportStyle[key]
                }
                else if (key === "vertical-align") style["alignItems"] = reportStyle[key]
                    .replace("top", "start")
                    .replace("middle", "center")
                    .replace("bottom", "end");
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
                        .map((x: string) => x.includes("cm") ? x : `${x}cm`)
                        .join(" ");
                }
                else if (key === "color") style["color"] = reportStyle[key]
                else if (key === "background") style["background"] = reportStyle[key]

            }
        }
    }

    isCellSelected(clickParams: CellSelection) {
        if (clickParams.type === "none") return;
        const { pageIdx, columnSetIdx, rowSetIdx, rowIdx, columnIdx } = clickParams
        const { selStart, selEnd } = this.state;
        if (this.state.selList.has(stableStringify(clickParams))) return true
        if (!selStart || !selEnd) return false;
        if (selStart.type === "none" || selEnd.type === "none") return

        if (selStart?.pageIdx !== pageIdx ||
            selStart?.columnSetIdx !== columnSetIdx ||
            selStart?.rowSetIdx !== rowSetIdx) return

        const { rMin, rMax, cMin, cMax } = this.props.q2report.getSelectionRanges(selStart, selEnd)

        return (rowIdx >= rMin && rowIdx <= rMax && columnIdx >= cMin && columnIdx <= cMax);
    };

    showDataSets = () => {
        const dataViewer = new Q2Form("", "Data Viewer", "dw", { hasOkButton: true, });
        const { data_set } = this.props.reportEditor;
        dataViewer.add_control("data", "", { control: "widget", data: { widget: JsonEditor, props: { data: data_set } } });
        showDialog(dataViewer)
    }

    runReport(fmt: string) {
        uploadAndDownload(this.props.q2report, this.props.reportEditor.data_set, fmt)
    }

    render() {
        const { selection, q2report, handleSelect, handleContextMenu, zoomWidthPx } = this.props;
        const isSelected = selection?.type === "report";
        return (
            <div>
                <div
                    className="q2-report-header"
                    style={{
                        background: isSelected ? selectionColor : "#f0f0f0",
                        minWidth: `${firstColWidthPx + secondColWidthPx + zoomWidthPx}px`
                    }}
                    onClick={() => handleSelect({ type: "report" })}
                    onContextMenu={e => handleContextMenu(e, { type: "report" })}
                >
                    <div style={{ minWidth: firstColWidthPx + secondColWidthPx + 1, borderRight: "1px solid #BBB" }}>
                        Report
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Q2Button {...{ column: new Q2Control("b1", "HTML", { valid: () => this.runReport("html") }) }} />
                        <Q2Button {...{ column: new Q2Control("b1", "DOCX", { valid: () => this.runReport("docx") }) }} />
                        <Q2Button {...{ column: new Q2Control("b1", "XLSX", { valid: () => this.runReport("xlsx") }) }} />
                        <Q2Button {...{ column: new Q2Control("b1", "PDF", { disabled: true }) }} />
                        <div style={{ width: "90px" }}></div>
                        <Q2Button {...{ column: new Q2Control("b1", "View data", { valid: this.showDataSets }) }} />
                    </div>
                </div>

                {
                    q2report.getReport().pages.map((page: any, pageIdx: number) => (
                        <div key={`page-${pageIdx}`} style={{ marginBottom: 12 }}>
                            {this.RenderPage(page, pageIdx)}
                        </div>
                    ))
                }
            </div >
        );
    }
}

export { Q2ReportEditor };

