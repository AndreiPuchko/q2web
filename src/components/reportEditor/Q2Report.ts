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
        const real_rowIdx = rowSetIdx?.replace("-header", "").replace("-footer", "");
        let rowSet = undefined;
        if (rowSetIdx.includes("-header")) { rowSet = columns.rows?.[real_rowIdx].table_header }
        else if (rowSetIdx.includes("-footer")) { rowSet = columns.rows?.[real_rowIdx].table_footer }
        else { rowSet = columns.rows?.[real_rowIdx] };
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
}
