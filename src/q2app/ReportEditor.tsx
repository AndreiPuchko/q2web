import React, { Component } from "react";

interface Q2ReportEditorProps {
    zoomWidthPx?: number;
}

class Q2ReportEditor extends Component<Q2ReportEditorProps> {
    static defaultProps = {
        zoomWidthPx: 700,
    };

    report = {
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
                        widths: ["20%", "20%", "0.0", "3.00", "3.0"],
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

    private calcColumnsWidths(column: any, availableWidthCm: number, pxPerCm: number) {
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
        const cellHeightPx = 0.5 * pxPerCm;
        return { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx, cellHeightPx };
    }

    renderReport() {
        const buttonStyle = {
            padding: "6px 18px",
            fontSize: 12,
            borderRadius: "10px",
            width: "10cap"
        };
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#f0f0f0",
                    borderBottom: "2px solid #888",
                    marginBottom: 2,
                    minHeight: 40,
                }}
            >
                <div
                    style={{
                        width: 162,
                        fontWeight: "bold",
                        fontSize: 14,
                        color: "#333",
                        textAlign: "center",
                        background: "#e0e0e0",
                        padding: "8px 0",
                        borderRight: "1px solid #b0b0b0",
                        boxSizing: "border-box",
                    }}
                >
                    Report
                </div>
                <div style={{ flex: 1, paddingLeft: 16, display: "flex", gap: 12 }}>
                    <button style={buttonStyle}>HTML</button>
                    <button style={buttonStyle}>DOCX</button>
                    <button style={buttonStyle}>XLSX</button>
                    <button style={buttonStyle}>PDF</button>
                </div>
            </div>
        );
    }

    RenderPage(page: any, pageIdx: number) {
        const { zoomWidthPx } = this.props;
        const availableWidthCm = page.page_width - page.page_margin_left - page.page_margin_right;
        const pxPerCm = zoomWidthPx / availableWidthCm;

        // Render all columns for this page
        return (
            <div>
                {/* Page info row */}
                <div
                    style={{
                        display: "flex",
                        background: "#f9fbe7",
                        borderBottom: "2px solid #888",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            width: 161,
                            padding: "4px 0",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: 13,
                            color: "#444",
                            borderRight: "1px solid #b0c4de",
                            background: "#f9fbe7",
                        }}
                    >
                        Page [{pageIdx}]
                    </div>
                    <div
                        style={{
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
                {/* Columns and rows for each column */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column", // Ensure columns are stacked vertically
                        flexWrap: "nowrap",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {page.columns.map((column: any, colIdx: number) => {
                        // --- width calculations for each column ---
                        const { gridWidthPx, firstColWidthPx, secondColWidthPx, cellWidthsPx, cellHeightPx } = this.calcColumnsWidths(column, availableWidthCm, pxPerCm);
                        return (
                            <div
                                key={colIdx}
                                style={{
                                    display: "flex",
                                    margin: 0,
                                    background: "#BBB",
                                    border: "1px solid #888",
                                    padding: 0,
                                    width: gridWidthPx + firstColWidthPx + secondColWidthPx,
                                }}
                            >
                                {this.renderColumns(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, cellHeightPx)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    renderColumns(column: any, cellWidthsPx: number[], firstColWidthPx: number, secondColWidthPx: number, cellHeightPx: number) {
        return (
            <div style={{
                
            }}>
                <div
                    style={{
                        display: "flex",
                        margin: 0,
                        padding: 0,
                        background: "#e0eaff",
                        borderBottom: "1px solid #888",
                    }}
                >
                    <div
                        style={{
                            width: `${firstColWidthPx + secondColWidthPx + 1}px`,
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
                {/* Render rows section here */}
                {this.renderRows(column, cellWidthsPx, firstColWidthPx, secondColWidthPx, cellHeightPx)}
            </div>
        );
    }

    renderRows(column: any, cellWidthsPx: number[], firstColWidthPx: number, secondColWidthPx: number, cellHeightPx: number) {
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

    render() {
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
                {this.renderReport()}
                {this.report.pages.map((page, pageIdx) => (
                    <div key={pageIdx} style={{ marginBottom: 12 }}>
                        {this.RenderPage(page, pageIdx)}
                    </div>
                ))}
            </div>
        );
    }
}

export { Q2ReportEditor };
