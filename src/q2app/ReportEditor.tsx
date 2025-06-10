import React from "react";

const Q2ReportEditor: React.FC<{ zoomWidthPx?: number }> = ({ zoomWidthPx = 800 }) => {
    const report = {
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
                        widths: ["10%", "20%", "0.0", "3.00", "3.0"],
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
            }
        ]
    };

    // Calculate px per cm based on 18cm = zoomWidthPx
    const pxPerCm = zoomWidthPx / 18;

    // Get page and margins
    const page = report.pages[0];
    const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;

    // Helper to render a single grid for a column
    function renderGrid(column: any, colIdx: number) {
        const rowCount = column.rows[0]?.heights.length || 0; // Use heights to determine rows
        const colCount = column.widths.length;

        // Parse widths and classify columns
        let percentTotal = 0;
        let cmTotal = 0;
        let zeroCount = 0;

        column.widths.forEach((w: string) => {
            if (parseFloat(w) === 0.00) {
                zeroCount = zeroCount + 1;
            } else if (w.includes("%")) {
                const pct = parseFloat(w);
                percentTotal += isNaN(pct) ? 0 : pct;
            } else {
                cmTotal += parseFloat(w);
            }
        });
        const pzCm = (availableWidthCm - cmTotal) / 100
        const zeroCm = availableWidthCm - cmTotal - pzCm * percentTotal

        const colWidthsCm = [];
        column.widths.forEach((w: string) => {
            if (parseFloat(w) === 0.00) {
                colWidthsCm.push(zeroCm / zeroCount)
            } else if (w.endsWith("%")) {
                colWidthsCm.push(parseFloat(w) * pzCm)
            } else {
                colWidthsCm.push(parseFloat(w))
            }
        });


        // --- Correction: scale all columns so their sum in px is exactly zoomWidthPx ---
        const totalCm = colWidthsCm.reduce((a, b) => a + b, 0);
        const scale = totalCm > 0 ? (zoomWidthPx / (totalCm * pxPerCm)) : 1;
        const scaledColWidthsCm = colWidthsCm.map(cm => cm * scale);

        // Fixed widths for the first two columns (do not scale)
        const firstColWidthPx = 80;
        const secondColWidthPx = 80;

        // Calculate cell widths in px (do not include first two columns)
        const cellWidthsPx = scaledColWidthsCm.map(cm => cm * pxPerCm);
        // Calculate grid width in px (should be exactly zoomWidthPx for data columns only)
        const gridWidthPx = cellWidthsPx.reduce((a, b) => a + b, 0);

        // Calculate cell height in px (use 1.5cm per row for now)
        const cellHeightPx = 0.5 * pxPerCm;

        return (
            <div
                key={colIdx}
                style={{
                    display: "inline-block",
                    margin: 0,
                    background: "#BBB",
                    border: "1px solid #888",
                    padding: 0,
                    width: gridWidthPx + firstColWidthPx + secondColWidthPx,
                }}
            >
                {/* Show row with columns widths */}
                <div
                    style={{
                        display: "flex",
                        margin: 0,
                        padding: 0,
                        background: "#e0eaff",
                        borderBottom: "1px solid #888",
                    }}
                >
                    {/* First column: "Columns" label */}
                    <div
                        style={{
                            width: `${firstColWidthPx}px`,
                            textAlign: "center",
                            fontSize: 12,
                            color: "#333",
                            background: "#d0eaff",
                            borderRight: "1px solid #b0c4de",
                            padding: "2px 0",
                            boxSizing: "border-box",
                            fontWeight: "bold",
                        }}
                    >
                        Columns
                    </div>
                    {/* Second column: heights info (empty for header row) */}
                    <div
                        style={{
                            width: `${secondColWidthPx}px`,
                            textAlign: "center",
                            fontSize: 12,
                            color: "#333",
                            background: "#e0f7fa",
                            borderRight: "1px solid #b0c4de",
                            padding: "2px 0",
                            boxSizing: "border-box",
                        }}
                    >
                    </div>
                    {/* Then the widths columns */}
                    {cellWidthsPx.map((w, i) => (
                        <div
                            key={i}
                            style={{
                                width: `${w}px`,
                                textAlign: "center",
                                fontSize: 12,
                                color: "#333",
                                background: "#e0eaff",
                                borderRight: i < cellWidthsPx.length - 1 ? "1px solid #b0c4de" : "none",
                                padding: "2px 0",
                                boxSizing: "border-box",
                            }}
                        >
                            {column.widths[i]}
                        </div>
                    ))}
                </div>

                {/* Render each row set as its own grid, with its own row count */}
                {column.rows.map((rowSet: any, rowSetIdx: number) => {
                    const rowCount = rowSet.heights.length || 0;
                    return (
                        <div
                            key={rowSetIdx}
                            style={{
                                display: "grid",
                                gridTemplateColumns: `${firstColWidthPx}px ${secondColWidthPx}px ${cellWidthsPx.map(w => `${w}px`).join(" ")}`,
                                gridTemplateRows: `repeat(${rowCount}, ${cellHeightPx}px)`,
                                gap: 0,
                                background: "#888",
                                margin: 0,
                                padding: 0,
                                borderBottom: rowSetIdx < column.rows.length - 1 ? "2px solid #888" : undefined,
                            }}
                        >
                            {Array.from({ length: rowCount }).map((_, rowIdx) =>
                                [
                                    // First column: "Rows" label for first row only
                                    <div
                                        key={`label-${rowIdx}`}
                                        style={{
                                            background: "#f0f8ff",
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
                                            fontWeight: rowIdx === 0 ? "bold" : undefined,
                                        }}
                                    >
                                        {rowIdx === 0 ? "Rows" : ""}
                                    </div>,
                                    // Second column: heights for this row
                                    <div
                                        key={`height-${rowIdx}`}
                                        style={{
                                            background: "#e0f7fa",
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
                                        }}
                                    >
                                        {(rowSet.heights && rowSet.heights[rowIdx]) || ""}
                                    </div>,
                                    // The grid cells
                                    ...Array.from({ length: colCount }).map((_, cellIdx) => {
                                        const cellKey = `${cellIdx},${rowIdx}`;
                                        const cell = rowSet.cells && rowSet.cells[cellKey];
                                        return (
                                            <div
                                                key={cellKey}
                                                style={{
                                                    background: "#fafafa",
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
                                                }}
                                            >
                                                {cell ? cell.data : ""}
                                            </div>
                                        );
                                    })
                                ]
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div style={{
            padding: 0,
            background: "#AAA",
            boxShadow: "0 2px 8px #0002",
            // maxWidth: `${zoomWidthPx+ 2}px`,
            width: "100%",
            height: "100%",
            overflow: "auto",
            marginTop: "50px",
        }}>
            <div style={{ display: "flex", flexWrap: "wrap", margin: 0, padding: 0 }}>
                {report.pages[0].columns.map((col, idx) => renderGrid(col, idx))}
            </div>
        </div>
    );
};

export { Q2ReportEditor };
