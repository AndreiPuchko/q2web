import { Component } from "react";
import { Q2Form } from "../../q2_modules/Q2Form";
import Form from '../Form';
// import { getPage, getColsSet, getWidth, getRowsSet, getHeight, getCell } from "./Q2Report";


interface ContentProps {
    selection: any;
    q2report: any;
    reportEditor: any;
}

class Q2ContentEditor extends Component<ContentProps> {

    q2report = this.props.q2report;

    defineSectionEditor() {
        const editor = new Q2Form("", "", "");

        editor.add_control("/h", "")
        editor.add_control("printwhen", "Print when");
        editor.add_control("calcafter", "Calc after");
        editor.add_control("onnewpage", "Make new page", { control: "check" });
        editor.add_control("ejectpage", "Make new page after", { control: "check" });
        return editor
    }

    defineWidthEditor() {
        // const width = getWidth(this.props.selection, this.props.report);
        const width = this.q2report.getWidth(this.props.selection);
        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("width", "Width", { datalen: 6, datadec: 2, datatype: "num", data: width.replace("%", ""), range: "0" });
        editor.add_control("pz", "%", { control: "check", data: width.includes("%") ? true : false });
        return editor
    }

    defineHeightEditor() {
        const heights = this.q2report.getHeight(this.props.selection).split("-")
        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("h", "Height", { control: "label" });
        editor.add_control("h0", "minimal", { data: heights[0], datalen: 6, datadec: 2, datatype: "num", range: "0" });
        editor.add_control("h1", "maximal", { data: heights[1], datalen: 6, datadec: 2, datatype: "num", range: "0" });
        editor.add_control("/s", "")
        return editor
    }

    defineCellEditor() {
        const cell = this.q2report.getCell(this.props.selection);

        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        editor.add_control("data", "Cell content", { stretch: 8, data: cell.data ? cell.data : "" });
        editor.add_control("format", "Format", { stretch: 1, data: cell.format ? cell.format : "" });
        editor.add_control("name", "Name", { stretch: 1, data: cell.name ? cell.name : "" });
        return editor
    }

    render() {
        const { selection, q2report } = this.props;
        const mode = this.props.selection?.type;

        let editor: Q2Form | string;
        if (mode === "row") editor = this.defineSectionEditor();
        else if (mode === "colwidth") editor = this.defineWidthEditor();
        else if (mode === "rowheight") editor = this.defineHeightEditor();
        else if (mode === "cell") editor = this.defineCellEditor();
        else editor = "";


        if (editor !== "") {
            console.log("render CE")
            editor.hookInputChanged = (form) => {
                const dataChunk: { [key: string]: number | string } = {};
                
                // console.log("!!", selection.type, form.focus)
                if (selection.type === "colwidth") {
                    dataChunk["width"] = form.s["width"];
                    if (editor.s.pz) {
                        dataChunk["width"] = dataChunk["width"] + "%";
                    }
                }
                // Rerender report layout if data were changed
                if (q2report.setObjectContent(selection, dataChunk)) {
                    console.log(this.props)
                    // this.forceUpdate();
                    this.props.reportEditor.forceUpdate();
                }
            }
            return (
                <>
                    <div className="q2-report-content-editor">
                        {editor !== "" && < Form q2form={editor} />}
                    </div>
                </>
            );
        }
        else {
            return (
                <>
                    <div className="q2-report-content-editor">

                    </div>
                </>)
        }
    }
}

export default Q2ContentEditor;
