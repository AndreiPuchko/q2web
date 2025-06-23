import { Component } from "react";
import { Q2Form, Q2Control } from "../../q2_modules/Q2Form";
import { getPageStyle, getColsSetStyle, getCellStyle, getRowsSetStyle } from "./Q2Report";
import Form from '../Form';


interface ContentProps {
  selection: any;
  report: any;
}

class Q2PropsEditor extends Component<ContentProps> {
  bordersControl: Q2Control;
  paddingsControl: Q2Control;
  alignmentsControl: Q2Control;
  propsEditor: Q2Form;

  defineUi() {
    const { report, selection } = this.props;
    let styles = {};

    if (selection?.type === "page") {
      styles = getPageStyle(selection, report);
    }
    else if (selection?.type === "column") {
      styles = getColsSetStyle(selection, report);
    }
    else if (selection?.type === "row") {
      styles = getRowsSetStyle(selection, report);
    }
    else if (selection?.type === "cell") {
      styles = getCellStyle(selection, report);
    }
    else if (selection?.type === "report") {
      styles = { style: report.style, parentStyle: undefined };
    }


    styles = { style: report.style, parentStyle: undefined };

    // console.log(styles.style, styles.parentStyle)

    this.propsEditor = new Q2Form();

    if (this.propsEditor.add_control("/f", "Font")) {
      const fontSize = styles.style["font-size"].replace("pt", "")
      const fontFamily = styles.style["font-family"].replace("pt", "")
      const fontBold = styles.style["font-weight"]
      const fontItalic = styles.style["font-italic"] ? styles.style["font-italic"] : "";
      const fontUnderline = styles.style["font-underline"] ? styles.style["font-underline"] : "";

      this.propsEditor.add_control("font_family", "Font family", { datalen: 15, data: fontFamily, check: true, checkChecked: this.getCheckChecked() });
      this.propsEditor.add_control("font_size", "Font size", { datalen: 3, data: fontSize, check: true, checkChecked: true });
      this.propsEditor.add_control("font_weight", "Bold", { control: "check", data: fontBold, check: true, checkChecked: this.getCheckChecked() });
      this.propsEditor.add_control("font_italic", "Italic", { control: "check", data: fontItalic, check: true, checkChecked: this.getCheckChecked() });
      this.propsEditor.add_control("font_underline", "Underline", { control: "check", data: fontUnderline, check: true, checkChecked: this.getCheckChecked() });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");
    }


    this.bordersControl = this.propsEditor.add_control("/h", "Borders", { alignment: 4, check: true, checkChecked: !!this.getCheckChecked(), tag: "borders" });
    if (this.bordersControl) {
      const borders = styles.style["border-width"].split(" ")
      this.propsEditor.add_control("border_left", "", { datalen: 3, data: borders[3] });
      this.propsEditor.add_control("/v", "");
      this.propsEditor.add_control("border_top", "", { datalen: 3, data: borders[0] });
      this.propsEditor.add_control("border_bottom", "", { datalen: 3, data: borders[2] });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("border_right", "", { datalen: 3, data: borders[1] });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }

    this.paddingsControl = this.propsEditor.add_control("/h", "Paddings", { alignment: 4, check: true, checkChecked: !!this.getCheckChecked(), tag: "paddings" });
    if (this.paddingsControl) {
      const paddings = styles.style["padding"].split(" ")
      this.propsEditor.add_control("padding_left", "", { datalen: 5, data: paddings[3].replace("cm", "") });
      this.propsEditor.add_control("/v");
      this.propsEditor.add_control("padding_top", "", { datalen: 5, data: paddings[0].replace("cm", "") });
      this.propsEditor.add_control("padding_bottom", "", { datalen: 5, data: paddings[2].replace("cm", "") });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("padding_right", "", { datalen: 5, data: paddings[1].replace("cm", "") });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }
    this.alignmentsControl = this.propsEditor.add_control("/v", "Aligments");
    if (this.alignmentsControl) {
      const hAlignment = { "left": "Left", "center": "Center", "right": "Right", "justify": "Justify" }[styles.style["text-align"]]
      const vAlignment = { "top": "Top", "middle": "Middle", "bottom": "Bottom" }[styles.style["vertical-align"]]
      this.propsEditor.add_control("text_align", "Horizontal",
        {
          pic: "Left;Center;Right;Justify",
          control: "radio",
          data: hAlignment,
          check: true,
          checkChecked: this.getCheckChecked()
        });
      this.propsEditor.add_control("vertical_align", "Vertical",
        {
          pic: "Top;Middle;Bottom",
          control: "radio",
          data: vAlignment,
          check: true,
          checkChecked: this.getCheckChecked()

        });
      this.propsEditor.add_control("/");  // close layout
    }


    return this.propsEditor
  }

  getCheckChecked() {
    const { report, selection } = this.props;
    // return false;
    return (selection?.type === "report")
  }

  setData(sel?: any, style?: any) {
    // console.log("set data", sel, style);
  }

  render() {
    const metaData = this.defineUi()
    return (
      <div>
        <div
          style={{
            background: "",
            color: "black",
            fontSize: "12px",
            border: "1px solid gray",
          }}
        >
          <Form metaData={metaData} />
        </div>
      </div>
    );
  }
}

export default Q2PropsEditor;
