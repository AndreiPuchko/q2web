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

export function getRowSet(selection: any, report: any) {
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
    const rowSet = getRowSet(selection, report);
    return rowSet.heights[heightIdx];
}
