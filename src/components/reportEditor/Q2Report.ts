import { CellSelection } from "./Q2ReportEditor"

export const defaultStyle = {
    "font-family": "Arial",
    "font-size": "12pt",
    "font-weight": "normal",
    "font-italic": "",
    "font-underline": "",
    "border-width": "1 1 1 1",
    "border-color": "black",
    "padding": "0.05cm 0.05cm 0.05cm 0.05cm",
    "text-align": "left",
    "vertical-align": "top"
}

export class Q2Report {
    report: any;

    constructor(report: any) {
        this.report = report;
    }

    get pages() {
        return this.report.pages;
    }

    get style() {
        return this.report.style;
    }

    getObject(selection: any) {
        if (!selection || !selection.type) return this.getReport();

        if (selection.type === "page") {
            return this.getPage(selection);
        } else if (selection.type === "column" || selection.type === "colwidth") {
            return this.getColsSet(selection);
        } else if (selection.type === "row" || selection.type === "rowheight") {
            return this.getRowsSet(selection);
        } else if (selection.type === "cell") {
            return this.getCell(selection);
        } else if (selection.type === "report") {
            return this.getReport()
        }
        return this.getReport()
    }

    getReport() {
        return this.report;
    }

    getPage(selection: any) {
        const { pageIdx } = selection;
        return this.report.pages?.[pageIdx];
    }

    setPageData(pageIdx: number, data: { [key: string]: any }) {
        // data is expected to be an object: { fieldName: value, ... }
        const page = this.report.pages?.[pageIdx];
        if (!page) return false;
        let changed = false;
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (key in page && parseFloat(page[key]) != parseFloat(data[key])) {
                    page[key] = data[key];
                    changed = true;
                }
            }
        }
        return changed;
    }

    getColsSet(selection: any) {
        const { columnSetIdx } = selection;
        const page = this.getPage(selection);
        return page?.columns?.[columnSetIdx];
    }

    getWidth(selection: any) {
        const { widthIdx } = selection;
        const columns = this.getColsSet(selection);
        return columns["widths"][widthIdx];
    }

    getRowsSet(selection: any) {
        const { rowSetIdx } = selection;
        const columns = this.getColsSet(selection);
        // Defensive: only use replace if rowSetIdx is a string
        let real_rowIdx = rowSetIdx;
        if (typeof rowSetIdx === "string") {
            real_rowIdx = rowSetIdx.replace("-header", "").replace("-footer", "");
        }
        let rowSet = undefined;
        if (typeof rowSetIdx === "string" && rowSetIdx.includes("-header")) {
            rowSet = columns.rows?.[real_rowIdx].table_header;
        }
        else if (typeof rowSetIdx === "string" && rowSetIdx.includes("-footer")) {
            rowSet = columns.rows?.[real_rowIdx].table_footer;
        }
        else {
            rowSet = columns.rows?.[real_rowIdx];
        }
        return rowSet;
    }

    getHeight(selection: any) {
        const { heightIdx } = selection;
        const rowSet = this.getRowsSet(selection);
        return rowSet.heights[heightIdx];
    }

    getCell(selection: any) {
        const { rowIdx, columnIdx } = selection
        const cellKey = `${rowIdx},${columnIdx}`;
        const rowSet = this.getRowsSet(selection);
        return rowSet.cells[cellKey];
    }

    getReportStyle() {
        const reportStyle = { ...defaultStyle, ...this.report.style }
        return { style: reportStyle, parentStyle: undefined }
    }

    getPageStyle(selection: any) {
        const reportStyleObj = this.getReportStyle();
        const page = this.getPage(selection)
        return { style: page?.style, parentStyle: reportStyleObj.style }
    }

    getColsSetStyle(selection: any) {
        const pageStyleObj = this.getPageStyle(selection);
        const parentStyle = { ...(pageStyleObj.parentStyle || {}), ...(pageStyleObj.style || {}) };
        const columns = this.getColsSet(selection);
        return { style: columns?.style, parentStyle: parentStyle }
    }

    getRowsSetStyle(selection: any) {
        const colsSetStyleObj = this.getColsSetStyle(selection);
        const parentStyle = { ...(colsSetStyleObj.parentStyle || {}), ...(colsSetStyleObj.style || {}) };
        const rows = this.getRowsSet(selection);
        return { style: rows?.style, parentStyle: parentStyle }
    }

    getCellStyle(selection: any) {
        const rowsSetStyleObj = this.getRowsSetStyle(selection);
        const parentStyle = { ...(rowsSetStyleObj.parentStyle || {}), ...(rowsSetStyleObj.style || {}) };
        const cell = this.getCell(selection);
        return { style: cell?.style, parentStyle: parentStyle }
    }

    getStyle(selection: any) {
        if (!selection || !selection.type) return this.getReportStyle();

        if (selection.type === "page") {
            return this.getPageStyle(selection);
        } else if (selection.type === "column" || selection.type === "colwidth") {
            return this.getColsSetStyle(selection);
        } else if (selection.type === "row" || selection.type === "rowheight") {
            return this.getRowsSetStyle(selection);
        } else if (selection.type === "cell") {
            return this.getCellStyle(selection);
        } else if (selection.type === "report") {
            return this.getReportStyle()
        }
        return this.getReportStyle()
    }

    setObjectContent(selection: any, dataChunk: { [key: string]: number | string }) {

        let changed = false;
        const object = this.getObject(selection);
        if (selection.type === "colwidth") {
            if (dataChunk.width === undefined) return false;
            if (object.widths[selection.widthIdx] !== dataChunk.width) {
                changed = true;
                object.widths[selection.widthIdx] = dataChunk.width
            }
        }
        else if (selection.type === "rowheight") {
            if (typeof dataChunk.heights !== "string") return false;
            if (dataChunk.heights.includes("undefined")) return false;
            if (object.heights[selection.heightIdx] !== dataChunk.heights) {
                changed = true;
                object.heights[selection.heightIdx] = dataChunk.heights
            }
        }
        else if (selection.type === "cell") {
            for (let el of ["data", "format", "name"]) {
                if (object[el] !== dataChunk[el]) {
                    changed = true;
                    object[el] = dataChunk[el];
                }
            }
        }
        else if (selection.type === "row") {
            for (let el of ["print_when", "print_after", "new_page_before", "new_page_after"]) {
                if (object[el] !== dataChunk[el]) {
                    changed = true;
                    object[el] = dataChunk[el];
                }
            }
        }
        else if (selection.type === "page") {
            for (let el of ["page_width", "page_height", "page_margin_left", "page_margin_right", "page_margin_top", "page_margin_bottom"]) {
                if (object[el] !== dataChunk[el]) {
                    changed = true;
                    object[el] = dataChunk[el];
                }
            }
        }
        return changed;
    }

    setStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        if (selection.type === "report" || !selection || !selection.type) {
            return this.setReportStyle(dataChunk)
        }
        else if (selection.type === "page") {
            return this.setPageStyle(selection, dataChunk);
        } else if (selection.type === "column" || selection.type === "colwidth") {
            return this.setColsSetStyle(selection, dataChunk);
        } else if (selection.type === "row" || selection.type === "rowheight") {
            return this.setRowsSetStyle(selection, dataChunk);
        } else if (selection.type === "cell") {
            return this.setCellStyle(selection, dataChunk);
        }
    }

    setReportStyle(dataChunk: { [key: string]: number | string }) {
        for (const key in dataChunk) {
            this.report.style[key] = dataChunk[key];
        }
        return true
    }

    setPageStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const page = this.getPage(selection)
        return this.setObjectStyle(page, dataChunk)
    }

    setColsSetStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const columns = this.getColsSet(selection);
        return this.setObjectStyle(columns, dataChunk)
    }

    setRowsSetStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const rows = this.getRowsSet(selection);
        return this.setObjectStyle(rows, dataChunk)
    }

    setCellStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const cell = this.getCell(selection);
        return this.setObjectStyle(cell, dataChunk)
    }

    setObjectStyle(object: any, dataChunk: Record<string, any>) {
        let changed = false;
        // Remove keys from object.style that are not in dataChunk
        if (object.style) {
            for (const key of Object.keys(object.style)) {
                if (!(key in dataChunk)) {
                    delete object.style[key];
                    changed = true;
                }
            }
        } else {
            object.style = {};
        }
        for (const key in dataChunk) {
            object.style[key] = dataChunk[key];
            changed = true;
            // }
        }
        return changed;
    }

    removeObject(selection: any) {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const pageIdx = selection.pageIdx;
            if (typeof pageIdx !== "number" || !this.report.pages || this.report.pages.length <= 1) return false;
            this.report.pages.splice(pageIdx, 1);
            return true;
        } else if (selection.type === "column") {
            const columnSetIdx = selection.columnSetIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns || page.columns.length <= 1) return false;
            page.columns.splice(columnSetIdx, 1);
            return true;
        } else if (selection.type === "colwidth") {
            // TODO: do not remove last column and do not remove last 0 column
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;
            if (columns.widths.length === 1) return false;
            if (parseFloat(columns.widths[selection.widthIdx]) === 0 && columns.widths.filter((w: any) => {
                return parseFloat(w) === 0;
            }).length === 1) return false;

            function removeColumnHelper(rowSet: any) {
                const rowsCellsClone: Record<string, any> = {}
                Object.entries(rowSet.cells).forEach(([cellKey, cell]: [string, any]) => {
                    const colIndex = parseInt(cellKey.split(",")[1]);
                    if (colIndex < selection.widthIdx) {
                        rowsCellsClone[cellKey] = cell;
                    }
                    else if (colIndex > selection.widthIdx) {
                        const newKey = `${cellKey.split(",")[0]},${colIndex - 1}`;
                        rowsCellsClone[newKey] = cell;
                    }
                    // Adjust col spans
                    if (cell.colspan > 1 && colIndex <= selection.widthIdx && colIndex + cell.colspan - 1 >= selection.widthIdx) {
                        cell.colspan = cell.colspan - 1;
                    }
                })
                return rowsCellsClone;
            }

            Object.entries(columns.rows).forEach(([key, rowSet]: [string, any]) => {
                columns.rows[key].cells = removeColumnHelper(rowSet)
                if (rowSet.role === "table") {
                    if (rowSet?.table_header) rowSet.table_header.cells = removeColumnHelper(rowSet.table_header)
                    if (rowSet?.table_footer) rowSet.table_footer.cells = removeColumnHelper(rowSet.table_footer)
                }
            })
            columns.widths.splice(selection.widthIdx, 1)
            return true;
        } else if (selection.type === "row") {
            const rowSetIdx = selection.rowSetIdx;
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows || columns.rows.length <= 1) return false;
            const realRowIdx = typeof rowSetIdx === "string"
                ? parseInt(rowSetIdx.replace("-header", "").replace("-footer", ""))
                : rowSetIdx;
            columns.rows.splice(realRowIdx, 1);
            return true;
        } else if (selection.type === "rowheight") {
            // Remove a row (by index) from a rowSet, handling cell spans
            const { heightIdx } = selection;
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;
            // Use selected rowSet directly
            const rowSet = this.getRowsSet(selection);
            if (!rowSet || !rowSet.heights || !rowSet.cells) return false;
            const rowCount = rowSet.heights.length;
            // Do not delete if only 1 row
            if (rowCount <= 1) return false;

            // 1. Remove/adjust spanned cells
            // Find all cells that span into or from the row being removed
            const cellsToDelete: string[] = [];
            const cellsToAdjust: { key: string, newRowspan: number }[] = [];
            Object.entries(rowSet.cells).forEach(([key, cell]: [string, any]) => {
                const [rowIdx, columnIdx] = key.split(',').map(Number);
                const rowspan = cell?.rowspan > 1 ? cell.rowspan : 1;
                // If the cell starts at the row being removed
                if (rowIdx === heightIdx) {
                    if (rowspan > 1) {
                        // The cell spans down, so the next row will become the new "start" of the span
                        // Remove this cell, and add a new cell at [rowIdx+1, columnIdx] with rowspan-1
                        cellsToDelete.push(key);
                        // Only add new cell if the next row exists
                        if (rowIdx + 1 < rowCount) {
                            // Copy cell, adjust rowspan
                            const newCell = { ...cell, rowspan: rowspan - 1 };
                            // Remove data if needed (optional)
                            rowSet.cells[`${rowIdx + 1},${columnIdx}`] = newCell;
                        }
                    } else {
                        // Normal cell, just remove
                        cellsToDelete.push(key);
                    }
                } else if (rowIdx < heightIdx && rowIdx + rowspan > heightIdx) {
                    // This cell spans over the row being removed, reduce its rowspan
                    cellsToAdjust.push({ key, newRowspan: rowspan - 1 });
                }
            });
            // Remove cells
            for (const key of cellsToDelete) {
                delete rowSet.cells[key];
            }
            // Adjust rowspans
            for (const { key, newRowspan } of cellsToAdjust) {
                if (rowSet.cells[key]) {
                    rowSet.cells[key].rowspan = newRowspan;
                }
            }

            // 2. Remove the row height
            rowSet.heights.splice(heightIdx, 1);

            // 3. Remove all cells in the removed row (should already be handled above)
            // 4. Remove all cell keys that reference the removed row
            Object.keys(rowSet.cells).forEach(key => {
                const [rowIdx] = key.split(',').map(Number);
                if (rowIdx === heightIdx) {
                    delete rowSet.cells[key];
                }
            });

            // 5. Shift all cell keys after the removed row up by 1
            const newCells: { [key: string]: any } = {};
            Object.entries(rowSet.cells).forEach(([key, cell]: [string, any]) => {
                const [rowIdx, columnIdx] = key.split(',').map(Number);
                if (rowIdx > heightIdx) {
                    newCells[`${rowIdx - 1},${columnIdx}`] = cell;
                } else {
                    newCells[key] = cell;
                }
            });
            rowSet.cells = newCells;

            return true;
        }
        return false;
    }

    addObjectAboveBelow(selection: any, position: "above" | "below", cloneCurrent: boolean = false) {
        if (!selection || !selection.type) return false;
        const positionDelta = position === "above" ? 0 : 1

        if (selection.type === "page") {
            // Copy current page params, add columns/rows as described
            const pageIdx = selection.pageIdx;
            const page = this.getPage(selection);
            if (!page) return false;
            let newPage: any = {};

            if (cloneCurrent) {
                newPage = JSON.parse(JSON.stringify(page));
            }
            else {
                newPage = {
                    ...JSON.parse(JSON.stringify(page)),
                    columns: [
                        {
                            widths: ["0", "0", "0"],
                            rows: [
                                {
                                    heights: ["0-0"],
                                    role: "free",
                                    cells: { "0,0": {} }
                                }
                            ]
                        }
                    ]
                };
            }
            // Remove data from newPage columns/rows/cells
            newPage.columns.forEach((col: any) => {
                col.rows.forEach((row: any) => {
                    row.cells = { "0,0": {} };
                });
            });
            const insertIdx = position === "above" ? pageIdx : pageIdx + 1;
            this.report.pages.splice(insertIdx, 0, newPage);
            return true;
        } else if (selection.type === "column") {
            const columnSetIdx = selection.columnSetIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns) return false;

            let newColumn = {};
            if (cloneCurrent) {
                const column = page.columns[columnSetIdx];
                newColumn = JSON.parse(JSON.stringify(column));
            }
            else {
                newColumn = {
                    widths: ["0", "0", "0"],
                    rows: [
                        {
                            heights: ["0-0"],
                            role: "free",
                            cells: { "0,0": {} }
                        }
                    ]
                };
            }
            const insertIdx = position === "above" ? columnSetIdx : columnSetIdx + 1;
            page.columns.splice(insertIdx, 0, newColumn);
            return true;
        } else if (selection.type === "row") {
            const rowSetIdx = selection.rowSetIdx;
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;
            let newRow = {};
            if (cloneCurrent) {
                const realRowIdx = typeof rowSetIdx === "string"
                    ? parseInt(rowSetIdx.replace("-header", "").replace("-footer", ""))
                    : rowSetIdx;

                const rowSet = columns.rows[realRowIdx];
                newRow = JSON.parse(JSON.stringify(rowSet));
            }
            else {
                newRow = {
                    heights: ["0-0"],
                    role: "free",
                    cells: { "0,0": {} }
                };
            }
            const realRowIdx = typeof rowSetIdx === "string"
                ? parseInt(rowSetIdx.replace("-header", "").replace("-footer", ""))
                : rowSetIdx;
            const insertIdx = position === "above" ? realRowIdx : realRowIdx + 1;
            columns.rows.splice(insertIdx, 0, newRow);
            return true;
        } else if (selection.type === "rowheight") {
            const rowSet = this.getRowsSet(selection)
            const rowsCellsClone: Record<string, any> = {};
            Object.entries(rowSet.cells).forEach(([key, cell]: [string, any]) => {
                const rowIndex = parseInt(key.split(",")[0]);
                if (cloneCurrent && rowIndex === selection.heightIdx) {
                    rowsCellsClone[key] = JSON.parse(JSON.stringify(cell));
                    rowsCellsClone[key]["rowspan"] = 1;
                }
                if (rowIndex >= selection.heightIdx + positionDelta) {
                    const newKey = `${rowIndex + 1},${key.split(",")[1]}`;
                    rowsCellsClone[newKey] = cell;
                }
                else rowsCellsClone[key] = cell;
                // Adjust col spans
                if (cell.rowspan > 1 && rowIndex <= selection.heightIdx + positionDelta && rowIndex + cell.rowspan + positionDelta - 1 >= selection.heightIdx) {
                    cell.rowspan = cell.rowspan + 1;
                }
            })
            rowSet.heights.splice(selection.heightIdx, 0, rowSet.heights[selection.heightIdx])
            rowSet.cells = rowsCellsClone;
            console.log(rowsCellsClone)

        } else if (selection.type === "colwidth") {
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;
            // const clone = [];
            function addColumnHelper(rowSet: any) {
                const rowsCellsClone: Record<string, any> = {}
                Object.entries(rowSet.cells).forEach(([cellKey, cell]: [string, any]) => {
                    const colIndex = parseInt(cellKey.split(",")[1]);
                    if (cloneCurrent && colIndex === selection.widthIdx) {
                        rowsCellsClone[cellKey] = JSON.parse(JSON.stringify(cell));
                        rowsCellsClone[cellKey]["colspan"] = 1;
                    }
                    if (colIndex >= selection.widthIdx + positionDelta) {
                        const newKey = `${cellKey.split(",")[0]},${colIndex + 1}`;
                        rowsCellsClone[newKey] = cell;
                    }
                    else rowsCellsClone[cellKey] = cell;
                    // Adjust col spans
                    if (cell.colspan > 1 && colIndex <= selection.widthIdx + positionDelta && colIndex + cell.colspan + positionDelta - 1 >= selection.widthIdx) {
                        cell.colspan = cell.colspan + 1;
                    }
                })
                return rowsCellsClone;
            }
            Object.entries(columns.rows).forEach(([key, rowSet]: [string, any]) => {
                columns.rows[key].cells = addColumnHelper(rowSet)
                if (rowSet.role === "table") {
                    if (rowSet?.table_header) rowSet.table_header.cells = addColumnHelper(rowSet.table_header)
                    if (rowSet?.table_footer) rowSet.table_footer.cells = addColumnHelper(rowSet.table_footer)
                }
            })
            columns.widths.splice(selection.widthIdx, 0, columns.widths[selection.widthIdx])
            return true;
        }
        return false;
    }

    moveObject(selection: any, direction: "up" | "down") {
        const positionDelta = direction === "up" ? - 1 : 1;
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const pageIdx = selection.pageIdx;
            const pages = this.report.pages;
            if (!pages || pages.length <= 1) return false;
            const targetIdx = pageIdx + positionDelta;
            if (targetIdx < 0 || targetIdx >= pages.length) return false;
            const [item] = pages.splice(pageIdx, 1);
            pages.splice(targetIdx, 0, item);
            // Return new selection pointing to the moved page
            return { ...selection, pageIdx: targetIdx };
        } else if (selection.type === "column") {
            const columnSetIdx = selection.columnSetIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns || page.columns.length <= 1) return false;
            const targetIdx = direction === "up" ? columnSetIdx - 1 : columnSetIdx + 1;
            if (targetIdx < 0 || targetIdx >= page.columns.length) return false;
            const [item] = page.columns.splice(columnSetIdx, 1);
            page.columns.splice(targetIdx, 0, item);
            // Return new selection pointing to the moved column
            return { ...selection, colIdx: targetIdx };
        } else if (selection.type === "row") {
            const rowSetIdx = selection.rowSetIdx;
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows || columns.rows.length <= 1) return false;
            const realRowIdx = typeof rowSetIdx === "string"
                ? parseInt(rowSetIdx.replace("-header", "").replace("-footer", ""))
                : rowSetIdx;
            const targetIdx = direction === "up" ? realRowIdx - 1 : realRowIdx + 1;
            if (targetIdx < 0 || targetIdx >= columns.rows.length) return false;
            const [item] = columns.rows.splice(realRowIdx, 1);
            columns.rows.splice(targetIdx, 0, item);
            // Return new selection pointing to the moved row
            if (typeof rowSetIdx === "string") {
                // preserve "-header"/"-footer" suffix if present
                const suffix = rowSetIdx.endsWith("-header") ? "-header" : rowSetIdx.endsWith("-footer") ? "-footer" : "";
                return { ...selection, rowSetIdx: `${targetIdx}${suffix}` };
            }
            return { ...selection, rowSetIdx: targetIdx };
        } else if (selection.type === "colwidth") {
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;

            function moveColumnHelper(rowSet: any) {
                const rowsCellsClone: Record<string, any> = {}
                Object.entries(rowSet.cells).forEach(([cellKey, cell]: [string, any]) => {
                    const colIndex = parseInt(cellKey.split(",")[1]);
                    if (colIndex === selection.widthIdx) {
                        const newKey = `${cellKey.split(",")[0]},${colIndex + positionDelta}`;
                        rowsCellsClone[newKey] = cell;
                        if (cell.colspan > 1) {
                            cell.colspan = cell.colspan - positionDelta;
                        }
                    }
                    else if (colIndex === selection.widthIdx + positionDelta) {
                        const newKey = `${cellKey.split(",")[0]},${selection.widthIdx}`;
                        rowsCellsClone[newKey] = cell;
                        if (cell.colspan > 1) {
                            cell.colspan = cell.colspan + positionDelta;
                        }

                    }
                    else rowsCellsClone[cellKey] = cell;
                })
                return rowsCellsClone;
            }
            Object.entries(columns.rows).forEach(([key, rowSet]: [string, any]) => {
                columns.rows[key].cells = moveColumnHelper(rowSet)
                if (rowSet.role === "table") {
                    if (rowSet?.table_header) rowSet.table_header.cells = moveColumnHelper(rowSet.table_header)
                    if (rowSet?.table_footer) rowSet.table_footer.cells = moveColumnHelper(rowSet.table_footer)
                }
            })
            // columns.widths.splice(selection.widthIdx, 0, columns.widths[selection.widthIdx])
            const tmp = columns.widths[selection.widthIdx]
            columns.widths[selection.widthIdx] = columns.widths[selection.widthIdx + positionDelta]
            columns.widths[selection.widthIdx + positionDelta] = tmp;
            return { ...selection, widthIdx: selection.widthIdx + positionDelta };
        } else if (selection.type === "rowheight") {
            const rowsSet = this.getRowsSet(selection);
            if (!rowsSet || !rowsSet.cells) return false;
            const rowsCellsClone: Record<string, any> = {}
            Object.entries(rowsSet.cells).forEach(([key, cell]: [string, any]) => {
                const rowIndex = parseInt(key.split(",")[0]);
                if (rowIndex === selection.heightIdx) {
                    const newKey = `${rowIndex + positionDelta},${key.split(",")[1]}`;
                    rowsCellsClone[newKey] = cell;
                    if (cell.rowspan > 1) {
                        cell.rowspan = cell.rowspan - positionDelta;
                    }
                }
                else if (rowIndex === selection.heightIdx + positionDelta) {
                    const newKey = `${selection.heightIdx},${key.split(",")[1]}`;
                    rowsCellsClone[newKey] = cell;
                    if (cell.rowspan > 1) {
                        cell.rowspan = cell.rowspan + positionDelta;
                    }
                }
                else rowsCellsClone[key] = cell;
                rowsSet.cells = rowsCellsClone;
                const tmp = rowsSet.heights[selection.heightIdx]
                rowsSet.heights[selection.heightIdx] = rowsSet.heights[selection.heightIdx + positionDelta]
                rowsSet.heights[selection.heightIdx + positionDelta] = tmp;
            })
            return { ...selection, heightIdx: selection.heightIdx + positionDelta };
        }
        return { ...selection };
    }

    toggleHideShow(selection: any) {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const page = this.getPage(selection);
            if (!page || !page.columns) return false;
            // Hide/show all columns in the page
            const hidden = !page.hidden;
            page.hidden = hidden;
            page.columns.forEach((col: any) => {
                col.hidden = hidden;
                if (col.rows) {
                    col.rows.forEach((row: any) => row.hidden = hidden);
                }
            });
            return true;
        } else if (selection.type === "column") {
            const col = this.getColsSet(selection);
            if (!col || !col.rows) return false;
            const hidden = !col.hidden;
            col.hidden = hidden;
            col.rows.forEach((row: any) => row.hidden = hidden);
            return true;
        }
        return false;
    }

    getSelectionRanges(selStart: CellSelection, selEnd: CellSelection) {
        if (selEnd.type === "none" || selStart.type === "none") return

        const cellStart = this.getCell(selStart);
        const cellStartRowspan = (parseInt(cellStart.rowspan) ? cellStart.rowspan : 1) - 1
        const cellStartColspan = (parseInt(cellStart.colspan) ? cellStart.colspan : 1) - 1

        const cellEnd = this.getCell(selEnd);
        const cellEndRowspan = (parseInt(cellEnd.rowspan) ? cellEnd.rowspan : 1) - 1
        const cellEndColspan = (parseInt(cellEnd.colspan) ? cellEnd.colspan : 1) - 1

        let rMin = Math.min(selStart.rowIdx, selEnd.rowIdx);
        let rMax = Math.max(selStart.rowIdx + cellStartRowspan, selEnd.rowIdx + cellEndRowspan);

        let cMin = Math.min(selStart.columnIdx, selEnd.columnIdx);
        let cMax = Math.max(selStart.columnIdx + cellStartColspan, selEnd.columnIdx + cellEndColspan);

        const rowSet = this.getRowsSet(selStart);
        const columnSet = this.getColsSet(selStart);
        for (let r = 0; r < rowSet.heights.length; r++) {
            for (let c = 0; c < columnSet.widths.length; c++) {
                const cellKey = `${r},${c}`
                if (rowSet.cells.hasOwnProperty(cellKey)) {
                    const cell = rowSet.cells[cellKey];
                    const cRight = (parseInt(cell.colspan) ? cell.colspan : 1) - 1 + c
                    const rDown = (parseInt(cell.rowspan) ? cell.rowspan : 1) - 1 + r
                    if (r < rMin && (rMin <= rDown) && ((cMin <= c && c <= cMax) || (cMin <= cRight && cRight <= cMax)))
                        rMin = r
                    if (rDown > rMax && (rMin <= r && r <= rMax) && ((cMin <= c && c <= cMax) || (cMin <= cRight && cRight <= cMax)))
                        rMax = rDown

                    if (c < cMin && (cMin <= cRight) && ((rMin <= r && r <= rMax) || (rMin <= rDown && rDown <= rMax)))
                        cMin = c
                    if (cRight > cMax && (cMin <= c && c <= cMax) && ((rMin <= r && r <= rMax) || (rMin <= rDown && rDown <= rMax)))
                        cMax = cRight
                }
            }
        }
        return { rMin, rMax, cMin, cMax }
    }

    mergeSelectedCells(selectionState: any) {
        const { selStart, selEnd } = selectionState;
        const ranges = this.getSelectionRanges(selStart, selEnd)
        if (!ranges) return;
        const { rMin, rMax, cMin, cMax } = ranges;

        const firstCell = { ...selStart }
        firstCell.rowIdx = rMin
        firstCell.columnIdx = cMin

        const cell = this.getCell(firstCell)
        cell.rowspan = rMax - rMin + 1
        cell.colspan = cMax - cMin + 1
    }

    unmergeCell(selection: any) {
        const cell = this.getCell(selection)
        cell.rowspan = 0;
        cell.colspan = 0;
    }
}
