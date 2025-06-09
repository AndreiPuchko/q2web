import React from "react";

const Q2ReportEditor: React.FC<{ zoomWidthPx?: number }> = ({ zoomWidthPx = 600 }) => {
    const report = {
        pages: [
            {
                page_width: 21.0,
                page_height: 29.0,
                page_margin_left: 2.0,
                page_margin_top: 2.0,
                page_margin_right: 1.0,
                page_margin_bottom: 2.0,
                columns: [{
                    widths: ["10%", "20%", "0.0", "3.00", "3.0"],
                    rows: [{
                        heights: ["0-0", "0-0", "0-0", "0-0.30", "0-0"],
                        cells: {
                            "0,0": { data: "text", style: {} },
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

        column.widths.forEach((w: string, idx: number) => {
            if (parseFloat(w) === 0.00) {
                zeroCount = zeroCount +1;
            } else if (w.endsWith("%")) {
                const pct = parseFloat(w);
                percentTotal += isNaN(pct) ? 0 : pct;
            } else {
                const n = parseFloat(w);
                cmTotal += isNaN(n) ? 3 : n;
            }
        });
        const pzCm = (availableWidthCm - cmTotal) /100
        const zeroCm = availableWidthCm - cmTotal - pzCm * percentTotal

        const colWidthsCm = [];
        column.widths.forEach((w: string, idx: number) => {
            if (parseFloat(w) === 0.00) {
                colWidthsCm.push(zeroCm/zeroCount)
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

        // Calculate cell widths in px
        const cellWidthsPx = scaledColWidthsCm.map(cm => cm * pxPerCm);
        // Calculate grid width in px (should be exactly zoomWidthPx)
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
                    width: gridWidthPx,
                }}
            >
                <div style={{ textAlign: "center", marginTop: 4, fontSize: 12, color: "#555" }}>
                    Column {colIdx + 1}
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: cellWidthsPx.map(w => `${w}px`).join(" "),
                    gridTemplateRows: `repeat(${rowCount}, ${cellHeightPx}px)`,
                    gap: 0,
                    background: "#888",
                    margin: 0,
                    padding: 0,
                }}>
                    {Array.from({ length: rowCount }).map((_, rowIdx) =>
                        Array.from({ length: colCount }).map((_, cellIdx) => {
                            const cellKey = `${cellIdx},${rowIdx}`;
                            const cell = column.rows[0]?.cells[cellKey];
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
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: 0,
            background: "#AAA",
            boxShadow: "0 2px 8px #0002",
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
