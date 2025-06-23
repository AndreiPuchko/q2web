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
    return { style: {}, parentStyle: report.style }
}

export function getPageStyle(selection: any, report: any) {
    const page = getPage(selection, report)
    return { style: page?.style, parentStyle: report.style }
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