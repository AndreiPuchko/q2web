import { Component } from "react";
import { Q2Form } from "../../q2_modules/Q2Form";
import Form from '../Form';


interface ContentProps {
    selection: any;
    report: any;
}


class Q2ContentEditor extends Component<ContentProps> {

    getPage() {
        // const { type, pageIdx, colIdx, rowSetIdx, rowIdx, cellIdx, widthIdx, heightIdx } = this.props.selection;
        const { pageIdx } = this.props.selection;
        return this.props.report.pages?.[pageIdx]
    }

    getColsSet() {
        const { colIdx } = this.props.selection;
        const page = this.getPage()
        return page?.columns?.[colIdx]
    }

    getWidth() {
        const { widthIdx } = this.props.selection;
        const columns = this.getColsSet()
        return columns["widths"][widthIdx]
    }


    getRowSet() {
        const { rowSetIdx } = this.props.selection;
        const columns = this.getColsSet()
        const real_rowIdx = rowSetIdx?.replace("-header", "").replace("-footer", "")
        let rowSet = undefined;
        if (rowSetIdx.includes("-header")) { rowSet = columns.rows?.[real_rowIdx].table_header }
        else if (rowSetIdx.includes("-footer")) { rowSet = columns.rows?.[real_rowIdx].table_footer }
        else { rowSet = columns.rows?.[real_rowIdx] };
        return rowSet
    }

    getHeight() {
        const { heightIdx } = this.props.selection;
        const rowSet = this.getRowSet()
        return rowSet.heights[heightIdx]
    }


    defineSectionEditor() {
        const rowSet = this.getRowSet()

        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("printwhen", "Print when");
        editor.add_control("calcafter", "Calc after");
        editor.add_control("onnewpage", "Make new page", { control: "check" });
        editor.add_control("ejectpage", "Make new page after", { control: "check" });
        return editor
    }

    defineWidthEditor() {
        const width = this.getWidth();
        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("width", "Width", { datalen: 6, alignment: 6, data: width.replace("%", "") });
        editor.add_control("pz", "%", { control: "check", data: width.includes("%") ? true : false });
        return editor
    }

    defineHeightEditor() {
        const heights = this.getHeight().split("-")
        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("h", "Height", { control: "label" });
        editor.add_control("h0", "minimal", { data: heights[0] });
        editor.add_control("h1", "maximal", { data: heights[1] });
        return editor
    }

    defineCellEditor() {
        const { rowIdx, cellIdx } = this.props.selection;
        const cellKey = `${rowIdx},${cellIdx}`;
        const rowSet = this.getRowSet()
        const cell = rowSet.cells[cellKey];

        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("data", "Cell content", { stretch: 8, data: cell.data ? cell.data : "" });
        editor.add_control("format", "Format", { stretch: 1, data: cell.format ? cell.format : "" });
        editor.add_control("name", "Name", { stretch: 1, data: cell.name ? cell.name : "" });
        return editor
    }


    render() {
        const mode = this.props.selection?.type;
        return (
            <>
                <div className="q2-report-content-editor">
                    {mode === "row" && <Form metaData={this.defineSectionEditor()} />}
                    {mode === "colwidth" && <Form metaData={this.defineWidthEditor()} />}
                    {mode === "rowheight" && <Form metaData={this.defineHeightEditor()} />}
                    {mode === "cell" && <Form metaData={this.defineCellEditor()} />}
                    {mode === undefined && ""}
                </div>
            </>
        );
    }
}

export default Q2ContentEditor;
