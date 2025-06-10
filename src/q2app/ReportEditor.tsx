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
            },
            {
                page_width: 19.0,
                page_height: 29.0,
                page_margin_left: 2.0,
                page_margin_top: 2.0,
                page_margin_right: 1.0,
                page_margin_bottom: 2.0,
                columns: [
                    {
                        widths: ["10%", "20%", "0.0", "3.00", "3.0"],
                        rows: [{
                            heights: ["0-0", "0-0", "0-0", "0-0.30"],
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
                            heights: ["0-0", "0-0"],
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

    // Helper to render page section for a column
    function RenderPage(page: any, colCount: number, cellWidthsPx: number[], firstColWidthPx: number, secondColWidthPx: number) {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `${firstColWidthPx}px ${secondColWidthPx}px ${cellWidthsPx.map(w => `${w}px`).join(" ")}`,
                    background: "#f9fbe7",
                    borderBottom: "2px solid #888",
                    alignItems: "center",
                }}
            >
                {/* Span col 1 and 2 */}
                <div
                    style={{
                        gridColumn: "1 / span 2",
                        padding: "4px 0",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 13,
                        color: "#444",
                        borderRight: "1px solid #b0c4de",
                        background: "#f9fbe7",
                    }}
                >
                    Page
                </div>
                {/* Span col 3 to end */}
                <div
                    style={{
                        gridColumn: `3 / span ${colCount}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "4px 8px",
                        background: "#f9fbe7",
                    }}
                >
                    <label style={{ fontSize: 12, color: "#333" }}>
                        W:
                        <input
                            type="number"
                            value={page.page_width.toFixed(2)}
                            step="0.01"
                            style={{ width: 60, marginLeft: 2, marginRight: 8 }}
                            readOnly
                        />
                    </label>
                    <label style={{ fontSize: 12, color: "#333" }}>
                        H:
                        <input
                            type="number"
                            value={page.page_height.toFixed(2)}
                            step="0.01"
                            style={{ width: 60, marginLeft: 2, marginRight: 8 }}
                            readOnly
                        />
                    </label>
                    <label style={{ fontSize: 12, color: "#333" }}>
                        ML:
                        <input
                            type="number"
                            value={page.page_margin_left.toFixed(2)}
                            step="0.01"
                            style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                        />
                    </label>
                    <label style={{ fontSize: 12, color: "#333" }}>
                        MT:
                        <input
                            type="number"
                            value={page.page_margin_top.toFixed(2)}
                            step="0.01"
                            style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                        />
                    </label>
                    <label style={{ fontSize: 12, color: "#333" }}>
                        MR:
                        <input
                            type="number"
                            value={page.page_margin_right.toFixed(2)}
                            step="0.01"
                            style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                        />
                    </label>
                    <label style={{ fontSize: 12, color: "#333" }}>
                        MB:
                        <input
                            type="number"
                            value={page.page_margin_bottom.toFixed(2)}
                            step="0.01"
                            style={{ width: 45, marginLeft: 2, marginRight: 4 }}
                            readOnly
                        />
                    </label>
                </div>
            </div>
        );
    }

    // Helper to render columns widths row for a column
    function renderColumns(column: any, cellWidthsPx: number[], firstColWidthPx: number, secondColWidthPx: number) {
        return (
            <div
                style={{
                    display: "flex",
                    margin: 0,
                    padding: 0,
                    background: "#e0eaff",
                    borderBottom: "1px solid #888",
                }}
            >
                {/* First and second columns merged: "Columns" label */}
                <div
                    style={{
                        width: `${firstColWidthPx + secondColWidthPx}px`,
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
        );
    }

    // Helper to render rows section for a column
    function RenderRows(column: any, cellWidthsPx: number[], firstColWidthPx: number, secondColWidthPx: number, cellHeightPx: number) {
        const colCount = column.widths.length;
        return column.rows.map((rowSet: any, rowSetIdx: number) => {
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
                    {/* First column: "Rows" label spanning all rows */}
                    <div
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
                            fontWeight: "bold",
                            gridRow: `1 / span ${rowCount}`,
                            gridColumn: "1 / 2",
                        }}
                    >
                        Rows
                    </div>
                    {/* Second column: heights for each row */}
                    {Array.from({ length: rowCount }).map((_, rowIdx) => (
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
                                gridColumn: "2 / 3",
                                gridRow: `${rowIdx + 1} / ${rowIdx + 2}`,
                            }}
                        >
                            {(rowSet.heights && rowSet.heights[rowIdx]) || ""}
                        </div>
                    ))}
                    {/* The grid cells */}
                    {Array.from({ length: rowCount }).map((_, rowIdx) =>
                        Array.from({ length: colCount }).map((_, cellIdx) => {
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
                                        gridColumn: `${cellIdx + 3} / ${cellIdx + 4}`,
                                        gridRow: `${rowIdx + 1} / ${rowIdx + 2}`,
                                    }}
                                >
                                    {cell ? cell.data : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            );
        });
    }

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
                {renderColumns(column, cellWidthsPx, firstColWidthPx, secondColWidthPx)}
                {/* Render rows section */}
                {RenderRows(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, cellHeightPx)}
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
            {/* Render all pages */}
            {report.pages.map((page, pageIdx) => (
                <div key={pageIdx} style={{ marginBottom: 32 }}>
                    {/* Render page section only once per page at the top */}
                    {RenderPage(page, page.columns[0].widths.length,
                        (() => {
                            const column = page.columns[0];
                            let percentTotal = 0, cmTotal = 0, zeroCount = 0;
                            column.widths.forEach((w: string) => {
                                if (parseFloat(w) === 0.00) zeroCount++;
                                else if (w.includes("%")) percentTotal += isNaN(parseFloat(w)) ? 0 : parseFloat(w);
                                else cmTotal += parseFloat(w);
                            });
                            const pzCm = (page.page_width - page.page_margin_left - page.page_margin_right - cmTotal) / 100;
                            const zeroCm = page.page_width - page.page_margin_left - page.page_margin_right - cmTotal - pzCm * percentTotal;
                            const colWidthsCm = column.widths.map((w: string) =>
                                parseFloat(w) === 0.00
                                    ? zeroCm / zeroCount
                                    : w.endsWith("%")
                                        ? parseFloat(w) * pzCm
                                        : parseFloat(w)
                            );
                            const totalCm = colWidthsCm.reduce((a, b) => a + b, 0);
                            const pxPerCm = zoomWidthPx / 18;
                            const scale = totalCm > 0 ? (zoomWidthPx / (totalCm * pxPerCm)) : 1;
                            const scaledColWidthsCm = colWidthsCm.map(cm => cm * scale);
                            return scaledColWidthsCm.map(cm => cm * pxPerCm);
                        })(),
                        80, 80
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", margin: 0, padding: 0 }}>
                        {page.columns.map((col, idx) => renderGrid(col, idx))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export { Q2ReportEditor };
