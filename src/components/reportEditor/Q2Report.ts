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
        if (!selection || !selection.type) return this.getReport(selection);

        if (selection.type === "page") {
            return this.getPage(selection);
        } else if (selection.type === "column" || selection.type === "colwidth") {
            return this.getColsSet(selection);
        } else if (selection.type === "row" || selection.type === "rowheight") {
            return this.getRowsSet(selection);
        } else if (selection.type === "cell") {
            return this.getCell(selection);
        } else if (selection.type === "report") {
            return this.getReport(selection)
        }
        return this.getReport(selection)
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
        const { colIdx } = selection;
        const page = this.getPage(selection);
        return page?.columns?.[colIdx];
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
        const { rowIdx, cellIdx } = selection
        const cellKey = `${rowIdx},${cellIdx}`;
        const rowSet = this.getRowsSet(selection);
        return rowSet.cells[cellKey];
    }

    getReportStyle(selection: any) {
        const reportStyle = { ...defaultStyle, ...this.report.style }
        return { style: reportStyle, parentStyle: undefined }
    }

    getPageStyle(selection: any) {
        const reportStyleObj = this.getReportStyle(selection);
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
        if (!selection || !selection.type) return this.getReportStyle(selection);

        if (selection.type === "page") {
            return this.getPageStyle(selection);
        } else if (selection.type === "column" || selection.type === "colwidth") {
            return this.getColsSetStyle(selection);
        } else if (selection.type === "row" || selection.type === "rowheight") {
            return this.getRowsSetStyle(selection);
        } else if (selection.type === "cell") {
            return this.getCellStyle(selection);
        } else if (selection.type === "report") {
            return this.getReportStyle(selection)
        }
        return this.getReportStyle(selection)
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
            if (dataChunk.heights === undefined) return false;
            if (object.heights[selection.heightIdx] !== dataChunk.height) {
                changed = true;
                object.heights[selection.heightIdx] = dataChunk.height
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
            return this.setReportStyle(selection, dataChunk)
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

    setReportStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        for (const key in dataChunk) {
            this.report.style[key] = dataChunk[key];
        }
        return true
    }

    setPageStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const parentStyle = this.getReportStyle(selection).style;
        const page = this.getPage(selection)
        return this.setObjectStyle(parentStyle, page, dataChunk)
    }

    setColsSetStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const pageStyleObj = this.getPageStyle(selection);
        const parentStyle = { ...(pageStyleObj.parentStyle || {}), ...(pageStyleObj.style || {}) };
        const columns = this.getColsSet(selection);
        return this.setObjectStyle(parentStyle, columns, dataChunk)
    }

    setRowsSetStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const colsSetStyleObj = this.getColsSetStyle(selection);
        const parentStyle = { ...(colsSetStyleObj.parentStyle || {}), ...(colsSetStyleObj.style || {}) };
        const rows = this.getRowsSet(selection);
        return this.setObjectStyle(parentStyle, rows, dataChunk)
    }

    setCellStyle(selection: any, dataChunk: { [key: string]: number | string }) {
        const rowsSetStyleObj = this.getRowsSetStyle(selection);
        const parentStyle = { ...(rowsSetStyleObj.parentStyle || {}), ...(rowsSetStyleObj.style || {}) };
        const cell = this.getCell(selection);
        return this.setObjectStyle(parentStyle, cell, dataChunk)
    }

    setObjectStyle(parentStyle, object, dataChunk) {
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
            // if (key in parentStyle && (parentStyle[key]) != dataChunk[key]) {
                object.style[key] = dataChunk[key];
                changed = true;
            // }
        }
        return changed;
    }

    cloneObject(selection: any) {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const pageIdx = selection.pageIdx;
            const page = this.getPage(selection);
            if (!page) return false;
            const clone = JSON.parse(JSON.stringify(page));
            this.report.pages.splice(pageIdx + 1, 0, clone);
            return true;
        } else if (selection.type === "column") {
            const colIdx = selection.colIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns) return false;
            const column = page.columns[colIdx];
            if (!column) return false;
            const clone = JSON.parse(JSON.stringify(column));
            page.columns.splice(colIdx + 1, 0, clone);
            return true;
        } else if (selection.type === "row" ) {
            const rowSetIdx = selection.rowSetIdx;
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;
            // rowSetIdx may be a string with "-header" or "-footer"
            const realRowIdx = typeof rowSetIdx === "string"
                ? parseInt(rowSetIdx.replace("-header", "").replace("-footer", ""))
                : rowSetIdx;
            const rowSet = columns.rows[realRowIdx];
            if (!rowSet) return false;
            const clone = JSON.parse(JSON.stringify(rowSet));
            columns.rows.splice(realRowIdx + 1, 0, clone);
            return true;
        }
        return false;
    }

    removeObject(selection: any) {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const pageIdx = selection.pageIdx;
            if (typeof pageIdx !== "number" || !this.report.pages || this.report.pages.length <= 1) return false;
            this.report.pages.splice(pageIdx, 1);
            return true;
        } else if (selection.type === "column") {
            const colIdx = selection.colIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns || page.columns.length <= 1) return false;
            page.columns.splice(colIdx, 1);
            return true;
        } else if (selection.type === "row" ) {
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
            const { rowSetIdx, heightIdx } = selection;
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
                const [rowIdx, cellIdx] = key.split(',').map(Number);
                const rowspan = cell?.rowspan > 1 ? cell.rowspan : 1;
                // If the cell starts at the row being removed
                if (rowIdx === heightIdx) {
                    if (rowspan > 1) {
                        // The cell spans down, so the next row will become the new "start" of the span
                        // Remove this cell, and add a new cell at [rowIdx+1, cellIdx] with rowspan-1
                        cellsToDelete.push(key);
                        // Only add new cell if the next row exists
                        if (rowIdx + 1 < rowCount) {
                            // Copy cell, adjust rowspan
                            const newCell = { ...cell, rowspan: rowspan - 1 };
                            // Remove data if needed (optional)
                            rowSet.cells[`${rowIdx + 1},${cellIdx}`] = newCell;
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
                const [rowIdx, cellIdx] = key.split(',').map(Number);
                if (rowIdx > heightIdx) {
                    newCells[`${rowIdx - 1},${cellIdx}`] = cell;
                } else {
                    newCells[key] = cell;
                }
            });
            rowSet.cells = newCells;

            return true;
        }
        return false;
    }

    addObjectAboveBelow(selection: any, position: "above" | "below") {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            // Copy current page params, add columns/rows as described
            const pageIdx = selection.pageIdx;
            const page = this.getPage(selection);
            if (!page) return false;
            const newPage = {
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
            // Remove data from newPage columns/rows/cells
            newPage.columns.forEach(col => {
                col.rows.forEach(row => {
                    row.cells = { "0,0": {} };
                });
            });
            const insertIdx = position === "above" ? pageIdx : pageIdx + 1;
            this.report.pages.splice(insertIdx, 0, newPage);
            return true;
        } else if (selection.type === "column") {
            const colIdx = selection.colIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns) return false;
            const newColumn = {
                widths: ["0", "0", "0"],
                rows: [
                    {
                        heights: ["0-0"],
                        role: "free",
                        cells: { "0,0": {} }
                    }
                ]
            };
            const insertIdx = position === "above" ? colIdx : colIdx + 1;
            page.columns.splice(insertIdx, 0, newColumn);
            return true;
        } else if (selection.type === "row") {
            const rowSetIdx = selection.rowSetIdx;
            const columns = this.getColsSet(selection);
            if (!columns || !columns.rows) return false;
            const newRow = {
                heights: ["0-0"],
                role: "free",
                cells: { "0,0": {} }
            };
            const realRowIdx = typeof rowSetIdx === "string"
                ? parseInt(rowSetIdx.replace("-header", "").replace("-footer", ""))
                : rowSetIdx;
            const insertIdx = position === "above" ? realRowIdx : realRowIdx + 1;
            columns.rows.splice(insertIdx, 0, newRow);
            return true;
        }
        return false;
    }

    moveObject(selection: any, direction: "up" | "down") {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const pageIdx = selection.pageIdx;
            const pages = this.report.pages;
            if (!pages || pages.length <= 1) return false;
            const targetIdx = direction === "up" ? pageIdx - 1 : pageIdx + 1;
            if (targetIdx < 0 || targetIdx >= pages.length) return false;
            const [item] = pages.splice(pageIdx, 1);
            pages.splice(targetIdx, 0, item);
            // Return new selection pointing to the moved page
            return { ...selection, pageIdx: targetIdx };
        } else if (selection.type === "column") {
            const colIdx = selection.colIdx;
            const page = this.getPage(selection);
            if (!page || !page.columns || page.columns.length <= 1) return false;
            const targetIdx = direction === "up" ? colIdx - 1 : colIdx + 1;
            if (targetIdx < 0 || targetIdx >= page.columns.length) return false;
            const [item] = page.columns.splice(colIdx, 1);
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
        }
        return false;
    }

    toggleHideShow(selection: any) {
        if (!selection || !selection.type) return false;
        if (selection.type === "page") {
            const page = this.getPage(selection);
            if (!page || !page.columns) return false;
            // Hide/show all columns in the page
            const hidden = !page.hidden;
            page.hidden = hidden;
            page.columns.forEach(col => {
                col.hidden = hidden;
                if (col.rows) {
                    col.rows.forEach(row => row.hidden = hidden);
                }
            });
            return true;
        } else if (selection.type === "column") {
            const col = this.getColsSet(selection);
            if (!col || !col.rows) return false;
            const hidden = !col.hidden;
            col.hidden = hidden;
            col.rows.forEach(row => row.hidden = hidden);
            return true;
        }
        return false;
    }
}
