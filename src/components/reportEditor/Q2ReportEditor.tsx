import React, { Component } from "react";
import { Q2Report } from "./Q2Report";
import Q2StyleEditor from "./Q2StyleEditor";
import Q2ContentEditor from "./Q2ContentEditor";
import "./Q2ReportEditor.css";
import get_report_json from "./test_report"


interface Q2ReportEditorProps {
    zoomWidthPx?: number;
}

function stableStringify(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}

type Selection =
    | { type: "report" }
    | { type: "page", pageIdx: number }
    | { type: "column", pageIdx: number, columnSetIdx: number }
    | { type: "colwidth", pageIdx: number, columnSetIdx: number, widthIdx: number }
    | { type: "row", pageIdx: number, columnSetIdx: number, rowSetIdx: number }
    | { type: string, pageIdx: number, columnSetIdx: number, rowSetIdx: number }
    | { type: "rowheight", pageIdx: number, columnSetIdx: number, rowSetIdx: number, heightIdx: number }
    | { type: string, pageIdx: number, columnSetIdx: number, rowSetIdx: number, heightIdx: number }
    | { type: "cell", pageIdx: number, columnSetIdx: number, rowSetIdx: number, rowIdx: number, columnIdx: number }
    | { type: string, pageIdx: number, columnSetIdx: number, rowSetIdx: number, rowIdx: number, columnIdx: number }

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

    defaultMenu = ["Clone", "Add above", "Add below", "-", "Hide", "Show", "Move Up", "Move Down", "-", "❌Remove"];

    reportMenu = ["HTML", "DOCX", "XLSX", "PDF"];
    pageMenu = [...this.defaultMenu];
    columnsSectionMenu = [...this.defaultMenu];
    columnMenu = ["Clone", "Add left", "Add right", "-", "Move Left", "Move Right", "-", "❌Remove"];
    rowsSectionMenu = ["Clone", "Add above", "Add below", "-", "Move Up", "Move Down", "-", "❌Remove"];
    rowMenu = ["Clone", "Add above", "Add below", "-", "Move Up", "Move Down", "-", "❌Remove"];
    cellMenu = ["Merge selected cells", "Merge right", "Merge down", "-", "Unmerge cells"];

    handleSelect = (selection: Selection) => {
        if (selection.type !== "cell") this.reportViewRef.current?.clearSelection()
        this.setState({ selection: selection, contextMenu: undefined });
    };

    handleContextMenu = (e: React.MouseEvent, selection: Selection) => {
        if (selection.type !== "cell")
            this.reportViewRef.current?.clearSelection()
        else {
            if (!this.reportViewRef.current?.isCellSelected(selection)) {
                const newList = new Set();
                newList.add(selection)
                this.reportViewRef.current?.clearSelection()
                this.reportViewRef.current?.setState({ selStart: selection, selEnd: selection, selList: newList })
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
        if (command === "Clone") {
            if (this.q2report.addObjectAboveBelow(selection, "above", true)) {
                this.incrementVersion();
                this.setState({ contextMenu: undefined });
            }
            return;
        } else if (command === "❌Remove") {
            const sel = contextMenu.selection;
            if (this.q2report.removeObject(sel)) {
                this.incrementVersion();
                this.setState({
                    contextMenu: undefined,
                    selection: { type: "report" }
                });
            }
            return;
        } else if (command.startsWith("Add")) {
            const position = (command === "Add above" || command === "Add left") ? "above" : "below";
            if (this.q2report.addObjectAboveBelow(contextMenu.selection, position)) {
                this.incrementVersion();
                this.setState({
                    contextMenu: undefined,
                    selection: { type: "report" }
                });
            }
            return;
        } else if (command.startsWith("Move")) {
            const direction = (command === "Move Up" || command === "Move Left") ? "up" : "down";
            const newSelection = this.q2report.moveObject(contextMenu.selection, direction);
            this.incrementVersion();
            this.setState({
                contextMenu: undefined,
                selection: newSelection || this.state.selection
            });
            return;
        } else if ((command === "Hide" || command === "Show")) {
            this.q2report.toggleHideShow(contextMenu.selection);
            this.incrementVersion();
            this.setState({ contextMenu: undefined });
            return;
        } else if (command === "Unmerge cells") {
            this.q2report.unmergeCell(selection);
            this.incrementVersion();
            this.setState({
                contextMenu: undefined,
                selection: selection
            });
            return;
        } else if (command === "Merge selected cells") {
            console.log(this.reportViewRef.current.state);
            return;

        }
        console.log(command, contextMenu?.selection === selection);
    }

    renderContextMenu() {
        const { contextMenu } = this.state;
        if (!contextMenu) return null;

        // Pick menu items based on selection type
        let menuItems: string[] = [];
        const sel = contextMenu.selection;
        if (sel.type === "report") menuItems = this.reportMenu;
        else if (sel.type === "page") menuItems = this.pageMenu;
        else if (sel.type === "column") menuItems = this.columnsSectionMenu;
        else if (sel.type === "colwidth") menuItems = this.columnMenu;
        else if (sel.type === "row") menuItems = this.rowsSectionMenu;
        else if (sel.type === "rowheight") menuItems = this.rowMenu;
        else if (sel.type === "cell") menuItems = this.cellMenu;

        // Filter out "Move Up" and "Move Down" if only one object exists,
        // or "Move Up" for first, "Move Down" for last
        let filteredMenuItems = menuItems;
        if (sel.type === "page") {
            const count = this.q2report.pages.length;
            const idx = sel.pageIdx;
            const page = this.q2report.getPage(sel);
            filteredMenuItems = menuItems.filter(item =>
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
            filteredMenuItems = menuItems.filter(item =>
                (item !== "Show" || col.hidden) &&
                (item !== "Hide" || !col.hidden) &&
                (item !== "Move Up" || idx > 0) &&
                (item !== "Move Down" || idx < count - 1) &&
                (count > 1 || (item !== "Move Up" && item !== "Move Down"))
            );
        } else if (sel.type === "colwidth") {
            const col = this.q2report.getColsSet(sel);
            const count = col?.widths.length ?? 0;
            filteredMenuItems = menuItems.filter(item =>
                (item !== "Move Left" || sel.widthIdx > 0) &&
                (item !== "Move Right" || sel.widthIdx < count - 1)
            );
        } else if (sel.type === "row") {
            const columns = this.q2report.getColsSet(sel);
            const count = columns?.rows?.length ?? 0;
            let idx = sel.rowSetIdx;
            if (typeof idx === "string") {
                idx = parseInt(idx.replace("-header", "").replace("-footer", ""));
            }
            filteredMenuItems = menuItems.filter(item =>
                (item !== "Move Up" || idx > 0) &&
                (item !== "Move Down" || idx < count - 1) &&
                (count > 1 || (item !== "Move Up" && item !== "Move Down"))
            );
        } else if (sel.type === "rowheight") {
            const rowsSet = this.q2report.getRowsSet(sel);
            const count = rowsSet?.heights?.length ?? 0;
            filteredMenuItems = menuItems.filter(item =>
                (item !== "Move Up" || sel.heightIdx > 0) &&
                (item !== "Move Down" || sel.heightIdx < count - 1)
            );
        } else if (sel.type === "cell") {
            const columnSet = this.q2report.getColsSet(sel)
            const rowSet = this.q2report.getRowsSet(sel)
            const cell = this.q2report.getCell(sel)
            // console.log(this.state.selection)
            // console.log(columnSet.widths.length)
            // console.log(rowSet)
            // console.log(cell)
            filteredMenuItems = []
            if (this.reportViewRef.current?.isCellSelected(this.state.selection))
                filteredMenuItems.push("Merge selected cells");

            if (!this.reportViewRef.current?.isCellSelected(this.state.selection) &&
                this.state.selection.columnIdx !== columnSet.widths.length - 1)
                filteredMenuItems.push("Merge right");

            if (!this.reportViewRef.current?.isCellSelected(this.state.selection) &&
                this.state.selection.rowIdx !== rowSet.heights.length - 1)
                filteredMenuItems.push("Merge down");

            if ((cell.colspan > 1 || cell.rowspan > 1) && !this.reportViewRef.current?.isCellSelected(this.state.selection)) {
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
            <div>
                <Q2ContentEditor selection={this.state.selection} q2report={this.q2report} reportEditor={this} />
                <div className="q2-report-editor-container" >
                    <div className="q2-report-editor">
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
    selStart: {},
    selEnd: {},
    selList: Set,
    isDragging: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = { version: 0, selStart: {}, selEnd: {}, isDragging: false, selList: new Set() };
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
        this.setState({ selStart: {}, selEnd: {}, isDragging: false, selList: new Set() })
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
        const totalCm = colWidthsCm.reduce((a, b) => a + b, 0);
        const scale = totalCm > 0 ? (this.props.zoomWidthPx! / (totalCm * pxPerCm)) : 1;
        const scaledColWidthsCm = colWidthsCm.map(cm => cm * scale);
        const firstColWidthPx = 80;
        const secondColWidthPx = 80;
        const cellWidthsPx = scaledColWidthsCm.map(cm => cm * pxPerCm);
        const gridWidthPx = cellWidthsPx.reduce((a, b) => a + b, 0);
        return { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx };
    }

    RenderPage(page: any, pageIdx: number) {
        const { selection, q2report, handleSelect, handleContextMenu, zoomWidthPx } = this.props;
        const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;
        const pxPerCm = this.props.zoomWidthPx / availableWidthCm;
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
                        background: isSelected ? "#ffe066" : "#f9fbe7",
                        borderBottom: "2px solid #888",
                        alignItems: "center",
                        cursor: "pointer",
                        filter: isHidden ? "grayscale(0.5)" : undefined
                    }}
                    onClick={() => handleSelect({ type: "page", pageIdx })}
                    onContextMenu={e => handleContextMenu(e, { type: "page", pageIdx })}
                >
                    <div
                        className="q2-report-page"
                        style={{
                            background: isSelected ? "#ffe066" : "#f9fbe7",
                            minWidth: 161,
                            textDecoration: isHidden ? "line-through" : undefined,
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
                                    {this.renderColumns(column, [], 0, 0, pageIdx, columnSetIdx)}
                                </div>
                            );
                        }
                        if (column.hidden) {
                            return (
                                <div key={columnSetIdx}>
                                    {this.renderColumns(column, [], 0, 0, pageIdx, columnSetIdx, true)}
                                </div>
                            );
                        }
                        const { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx } =
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
                                {this.renderColumns(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, pageIdx, columnSetIdx)}
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

        // Always recalculate widths, even if hidden
        let widthsToUse = cellWidthsPx;
        let firstColWidth = firstColWidthPx;
        let secondColWidth = secondColWidthPx;
        if (isHidden && (!cellWidthsPx || cellWidthsPx.length === 0)) {
            // Recalculate widths if not provided (e.g. when called with [])
            const page = this.props.q2report.getPage({ pageIdx });
            const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;
            const pxPerCm = this.props.zoomWidthPx / availableWidthCm;
            const calc = this.calcColumnsWidths(column, availableWidthCm, pxPerCm);
            widthsToUse = calc.cellWidthsPx;
            firstColWidth = calc.firstColWidthPx;
            secondColWidth = calc.secondColWidthPx;
        }

        // Prepare header, section, footer
        const rowsContent: any[] = [];
        column.rows.forEach((rowSet: any, rowSetIdx: number) => {
            if (isHidden) {
                rowsContent.push(
                    <div key={rowSetIdx} style={{ height: 0, overflow: "hidden" }}>
                        {this.renderRows(column, widthsToUse, firstColWidth, secondColWidth, pageIdx, columnSetIdx, rowSet, rowSetIdx, true)}
                    </div>
                );
                return;
            }
            if (rowSet.hidden) {
                rowsContent.push(
                    <div key={rowSetIdx} style={{ height: 0, overflow: "hidden" }}>
                        {this.renderRows(column, widthsToUse, firstColWidth, secondColWidth, pageIdx, columnSetIdx, rowSet, rowSetIdx)}
                    </div>
                );
                return;
            }
            if (rowSet.table_header) {
                rowsContent.push(
                    this.renderRows(
                        column,
                        widthsToUse,
                        firstColWidth,
                        secondColWidth,
                        pageIdx,
                        columnSetIdx,
                        rowSet.table_header,
                        `${rowSetIdx}-header`
                    )
                );
            }
            // Main section
            rowsContent.push(
                this.renderRows(
                    column,
                    widthsToUse,
                    firstColWidth,
                    secondColWidth,
                    pageIdx,
                    columnSetIdx,
                    rowSet,
                    `${rowSetIdx}`
                )
            );
            if (rowSet.table_footer) {
                rowsContent.push(
                    this.renderRows(
                        column,
                        widthsToUse,
                        firstColWidth,
                        secondColWidth,
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
                        background: isSelected ? "#ffe066" : "#d0eaff",
                        borderBottom: "1px solid #888",
                        cursor: "pointer",
                        filter: isHidden ? "grayscale(0.7)" : undefined
                    }}
                    onClick={() => this.handleSelect({ type: "column", pageIdx: pageIdx!, columnSetIdx: columnSetIdx! })}
                    onContextMenu={e => this.handleContextMenu(e, { type: "column", pageIdx: pageIdx!, columnSetIdx: columnSetIdx! })}
                >
                    <div
                        className="q2-report-colssection-header"
                        style={{
                            width: `${firstColWidth + secondColWidth + 1}px`,
                            background: isSelected ? "#ffe066" : "#d0eaff",
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
                    {widthsToUse.map((w, i) => {
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
                                    background: isWidthSelected ? "#ffe066" : (isSelected ? "#ffe066" : "#e0eaff"),
                                    borderRight: i < widthsToUse.length - 1 ? "1px solid #b0c4de" : "none",
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
        firstColWidthPx: number,
        secondColWidthPx: number,
        pageIdx?: number,
        columnSetIdx?: number,
        rowSet?: any,
        rowSetIdx?: any,
        forceHidden?: boolean
    ) {
        // Only render a single rowSet (not a map)
        const colCount = column.widths.length;

        if (!rowSet) return null;
        const rowCount = rowSet.heights.length || 0;
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
                    height: isHidden ? 0 : undefined,
                    overflow: isHidden ? "hidden" : undefined,
                    background: isSelected ? "#ffe066" : "#EEE",
                    opacity: isHidden ? 0.5 : 1,
                    filter: isHidden ? "grayscale(0.7)" : undefined
                }}
            >
                {/* render rows's section "header" column  */}
                <div
                    className="q2-report-rowssection-header"
                    style={{
                        background: isSelected ? "#ffe066" : "#f0f8ff",
                        gridRow: `1 / span ${rowCount}`,
                        textDecoration: isHidden ? "line-through" : undefined,
                        color: isHidden ? "#888" : undefined
                    }}
                    onClick={e => { e.stopPropagation(); this.props.handleSelect(rowClickParams); }}
                    onContextMenu={e => { e.stopPropagation(); this.props.handleContextMenu(e, rowClickParams); }}
                >
                    {rowSet.role}{isHidden ? " (hidden)" : ""}
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
                                background: isHeightSelected ? "#ffe066" : (isSelected ? "#ffe066" : "#e0f7fa"),
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
        const clickParams = {
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
            backgroundColor: "#fafafa",
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

        if (isCurrent) {
            // cellStyle.backgroundColor = "#ffe066"
            cellStyle.outline = "2px solid lightgreen"
            cellStyle.outlineOffset = "-2px"
        }
        if (this.isCellSelected(clickParams) || this.state.selList.has(stableStringify(clickParams))) {
            cellStyle.backgroundColor = "#ffe066"
        }

        const selectedCell = { type: "cell", pageIdx: pageIdx, columnSetIdx: columnSetIdx, rowSetIdx: rowSetIdx, rowIdx: rowIdx, columnIdx: columnIdx };
        const reportCellStyles = this.props.q2report.getCellStyle(selectedCell);
        const reportCellStyle = { ...reportCellStyles.parentStyle, ...reportCellStyles.style };

        if (cell && cell.style) {
            this.adaptStyle(cellStyle, reportCellStyle);
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

    cellMouseDown(event, selection) {
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

    cellMouseEnter(e, sel) {
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
                        .map(x => x.includes("cm") ? x : `${x}cm`)
                        .join(" ");
                }
            }
        }
    }

    isCellSelected(clickParams) {
        const { pageIdx, columnSetIdx, rowSetIdx, rowIdx, columnIdx } = clickParams
        const { selStart, selEnd } = this.state;
        if (this.state.selList.has(stableStringify(clickParams))) return true
        if (!selStart || !selEnd) return false;
        if (selStart.pageIdx !== pageIdx ||
            selStart.columnSetIdx !== columnSetIdx ||
            selStart.rowSetIdx !== rowSetIdx) return

        const rMin = Math.min(selStart.rowIdx, selEnd.rowIdx);
        const rMax = Math.max(selStart.rowIdx, selEnd.rowIdx);
        const cMin = Math.min(selStart.columnIdx, selEnd.columnIdx);
        const cMax = Math.max(selStart.columnIdx, selEnd.columnIdx);
        // console.log(inSelList, this.state.selList, clickParams)
        return (rowIdx >= rMin && rowIdx <= rMax && columnIdx >= cMin && columnIdx <= cMax);
    };

    render() {
        const { selection, q2report, handleSelect, handleContextMenu, zoomWidthPx, reportEditor } = this.props;
        const buttonStyle = {
            padding: "3px 18px",
            margin: "1px 10px",
            cursor: "pointer",
            border: "1px solid",
            fontSize: 12,
            borderRadius: "7px",
            width: "9cap"
        };
        const isSelected = selection?.type === "report";


        return (
            <div>
                {/* <Q2ContentEditor selection={selection} q2report={q2report} reportEditor={reportEditor} /> */}
                <div
                    className="q2-report-header"
                    style={{ background: isSelected ? "#ffe066" : "#f0f0f0" }}
                    onClick={() => handleSelect({ type: "report" })}
                    onContextMenu={e => handleContextMenu(e, { type: "report" })}
                >
                    <div style={{ width: 161, borderRight: "1px solid #BBB" }}>Report</div>
                    {/* <div style={{ flex: 1, paddingLeft: 16, display: "flex", gap: 12 }}> */}
                    <div>
                        <button style={buttonStyle}>HTML</button>
                        <button style={buttonStyle}>DOCX</button>
                        <button style={buttonStyle}>XLSX</button>
                        <button style={buttonStyle}>PDF</button>
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

