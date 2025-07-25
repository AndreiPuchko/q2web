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

    definePageEditor() {
        const editor = new Q2Form("", "", "");
        editor.add_control("/h", "")
        const page = this.q2report.getObject(this.props.selection);

        editor.add_control("page_width", "W", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_width, range: "0" });
        editor.add_control("page_height", "H", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_height, range: "0" });
        editor.add_control("page_margin_left", "ML", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_left, range: "0" });
        editor.add_control("page_margin_right", "MR", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_right, range: "0" });
        editor.add_control("page_margin_top", "MT", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_top, range: "0" });
        editor.add_control("page_margin_bottom", "MB", { datalen: 6, datatype: "dec", datadec: 2, data: page.page_margin_bottom, range: "0" });
        return editor
    }

    defineSectionEditor() {
        const editor = new Q2Form("", "", "");
        const sectionData = this.q2report.getObject(this.props.selection);

        editor.add_control("/h", "")
        const roles = "free;table;header;footer";
        if (roles.includes(sectionData.role)) {
            editor.add_control("role", "Role", { data: sectionData.role, stretch: 1, control: "combo", pic: roles, datalen: 8 });
        }
        editor.add_control("print_when", "Print when", { data: sectionData.print_when, stretch: 3 });
        editor.add_control("print_after", "Calc after", { data: sectionData.print_after, stretch: 3 });
        editor.add_control("new_page_before", "On new page", { control: "check", data: sectionData.new_page_before });
        editor.add_control("new_page_after", "New page after", { control: "check", data: sectionData.new_page_after });
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

        let editor: Q2Form;
        if (mode === "row") editor = this.defineSectionEditor();
        else if (mode === "page") editor = this.definePageEditor();
        else if (mode === "colwidth") editor = this.defineWidthEditor();
        else if (mode === "rowheight") editor = this.defineHeightEditor();
        else if (mode === "cell") editor = this.defineCellEditor();
        else return (
            <><div className="q2-report-content-editor"></div></>
        );

        if (true) {
            editor.hookInputChanged = (form) => {
                const dataChunk: { [key: string]: number | string } = {};
                if (selection.type === "colwidth") {
                    dataChunk["width"] = form.s["width"];
                    if (editor.s.pz) {
                        dataChunk["width"] = dataChunk["width"] + "%";
                    }
                }
                else if (selection.type === "rowheight") {
                    dataChunk["heights"] = `${form.s.h0}-${form.s.h1}`;
                }
                else if (selection.type === "cell") {
                    dataChunk["data"] = form.s.data;
                    dataChunk["format"] = form.s.format;
                    dataChunk["name"] = form.s.name;
                }
                else if (selection.type === "row") {
                    if ("role" in form.s) {
                        dataChunk["role"] = form.s.role;
                    }
                    dataChunk["print_when"] = form.s.print_when;
                    dataChunk["print_after"] = form.s.print_after;
                    dataChunk["new_page_before"] = form.s.new_page_before;
                    dataChunk["new_page_after"] = form.s.new_page_after;
                }
                else if (selection.type === "page") {
                    dataChunk["page_width"] = form.s.page_width;
                    dataChunk["page_height"] = form.s.page_height;
                    dataChunk["page_margin_left"] = form.s.page_margin_left;
                    dataChunk["page_margin_right"] = form.s.page_margin_right;
                    dataChunk["page_margin_top"] = form.s.page_margin_top;
                    dataChunk["page_margin_bottom"] = form.s.page_margin_bottom;
                }
                // Rerender report layout if data were changed
                if (q2report.setObjectContent(selection, dataChunk)) {
                    setTimeout(() => {
                        this.props.reportEditor.incrementVersion();
                    }, 0);
                }
            }

            return (
                <>
                    <div className="q2-report-content-editor">
                        {< Form q2form={editor} />}
                    </div>
                </>
            );
        }
    }
}

export default Q2ContentEditor;
