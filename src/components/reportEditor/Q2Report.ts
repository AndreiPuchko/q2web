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

export function getReport(report: any) {
    return report;
}

export function getPage(selection: any, report: any) {
    const { pageIdx } = selection;
    return report.pages?.[pageIdx];
}

export function getColsSet(selection: any, report: any) {
    const { colIdx } = selection;
    const page = getPage(selection, report);
    return page?.columns?.[colIdx];
}

export function getWidth(selection: any, report: any) {
    const { widthIdx } = selection;
    const columns = getColsSet(selection, report);
    return columns["widths"][widthIdx];
}

export function getRowsSet(selection: any, report: any) {
    const { rowSetIdx } = selection;
    const columns = getColsSet(selection, report);
    const real_rowIdx = rowSetIdx?.replace("-header", "").replace("-footer", "");
    let rowSet = undefined;
    if (rowSetIdx.includes("-header")) { rowSet = columns.rows?.[real_rowIdx].table_header }
    else if (rowSetIdx.includes("-footer")) { rowSet = columns.rows?.[real_rowIdx].table_footer }
    else { rowSet = columns.rows?.[real_rowIdx] };
    return rowSet;
}

export function getHeight(selection: any, report: any) {
    const { heightIdx } = selection;
    const rowSet = getRowsSet(selection, report);
    return rowSet.heights[heightIdx];
}

export function getCell(selection: any, report: any) {
    const { rowIdx, cellIdx } = selection
    const cellKey = `${rowIdx},${cellIdx}`;
    const rowSet = getRowsSet(selection, report);
    return rowSet.cells[cellKey];
}

export function getReportStyle(selection: any, report: any) {
    const reportStyle = {...defaultStyle, ...report.style}
    return { style: reportStyle, parentStyle: undefined }
}

export function getPageStyle(selection: any, report: any) {
    const reportStyleObj = getReportStyle(selection, report);
    const page = getPage(selection, report)
    return { style: page?.style, parentStyle: reportStyleObj.style }
}

export function getColsSetStyle(selection: any, report: any) {
    const pageStyleObj = getPageStyle(selection, report);
    const parentStyle = { ...(pageStyleObj.parentStyle || {}), ...(pageStyleObj.style || {}) };
    const columns = getColsSet(selection, report);
    return { style: columns?.style, parentStyle: parentStyle }
}

export function getRowsSetStyle(selection: any, report: any) {
    const colsSetStyleObj = getColsSetStyle(selection, report);
    const parentStyle = { ...(colsSetStyleObj.parentStyle || {}), ...(colsSetStyleObj.style || {}) };
    const rows = getRowsSet(selection, report);
    return { style: rows?.style, parentStyle: parentStyle }
}

export function getCellStyle(selection: any, report: any) {
    const rowsSetStyleObj = getRowsSetStyle(selection, report);
    const parentStyle = { ...(rowsSetStyleObj.parentStyle || {}), ...(rowsSetStyleObj.style || {}) };
    const cell = getCell(selection, report);
    return { style: cell?.style, parentStyle: parentStyle }
}

export function getStyle(report: any, selection: any) {
    if (!selection || !selection.type) return getReportStyle(selection, report);

    if (selection.type === "page") {
        return getPageStyle(selection, report);
    } else if (selection.type === "column" || selection.type === "colwidth") {
        return getColsSetStyle(selection, report);
    } else if (selection.type === "row" || selection.type === "rowheight") {
        return getRowsSetStyle(selection, report);
    } else if (selection.type === "cell") {
        return getCellStyle(selection, report);
    } else if (selection.type === "report") {
        return getReportStyle(selection, report)
    }
    getReportStyle(selection, report)
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

    getReport() {
        return this.report;
    }

    getPage(selection: any) {
        const { pageIdx } = selection;
        return this.report.pages?.[pageIdx];
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
}