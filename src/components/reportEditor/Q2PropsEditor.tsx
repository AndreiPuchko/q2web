import { Component } from "react";
import { Q2Form, Q2Control } from "../../q2_modules/Q2Form";
import { getPageStyle, getColsSetStyle, getCellStyle, getRowsSetStyle } from "./Q2Report";
import Form from '../Form';

const defaultStyle = {
  "font-family": "Arial",
  "font-size": "12pt",
  "font-weight": "normal",
  "border-width": "1 1 1 1",
  "border-color": "black",
  "padding": "0.05cm 0.05cm 0.05cm 0.05cm",
  "text-align": "left",
  "vertical-align": "top"
}

interface ContentProps {
  selection: any;
  report: any;
}

class Q2PropsEditor extends Component<ContentProps> {
  bordersControl: Q2Control;
  paddingsControl: Q2Control;
  alignmentsControl: Q2Control;
  propsEditor: Q2Form;
  propsData: {};

  defineUi() {
    const { report, selection } = this.props;
    let styles: any = {};

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

    // Ensure styles.style and styles.parentStyle are always objects
    styles = {
      style: (styles && styles.style) ? styles.style : {},
      parentStyle: (styles && styles.parentStyle) ? styles.parentStyle : {}
    };

    // styles = { style: report.style, parentStyle: undefined };

    this.propsEditor = new Q2Form();
    this.propsData = this.getPropsData(styles)
    console.log(this.propsData)


    if (this.propsEditor.add_control("/f", "Font")) {

      this.propsEditor.add_control("font_family", "Font family",
        {
          datalen: 15,
          data: this.propsData["font-family"].data,
          check: true,
          checkChecked: this.getCheckChecked(),
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_size", "Font size",
        {
          datalen: 3,
          data: this.propsData["font-size"].data,
          check: true,
          checkChecked: true,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_weight", "Bold",
        {
          control: "check",
          data: (styles.style["font-weight"] || "") === "bold",
          check: true,
          checkChecked: this.getCheckChecked(),
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_italic", "Italic",
        {
          control: "check",
          data: (styles.style["font-italic"] || "") != "",
          check: true,
          checkChecked: this.getCheckChecked(),
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_underline", "Underline",
        {
          control: "check",
          data: (styles.style["font-underline"] || "") != "",
          check: true,
          checkChecked: this.getCheckChecked(),
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");
    }


    this.bordersControl = this.propsEditor.add_control("/h", "Borders",
      {
        alignment: 4,
        check: true,
        checkChecked: !!this.getCheckChecked(),
        checkDisabled: this.getCheckDisabled(),
        tag: "borders"
      });
    if (this.bordersControl) {
      const borders = (styles.style["border-width"] || "0 0 0 0").split(" ");
      this.propsEditor.add_control("border_left", "", { datalen: 3, data: borders[3] || "" });
      this.propsEditor.add_control("/v", "");
      this.propsEditor.add_control("border_top", "", { datalen: 3, data: borders[0] || "" });
      this.propsEditor.add_control("border_bottom", "", { datalen: 3, data: borders[2] || "" });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("border_right", "", { datalen: 3, data: borders[1] || "" });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }

    this.paddingsControl = this.propsEditor.add_control("/h", "Paddings",
      {
        alignment: 4,
        check: true,
        checkChecked: !!this.getCheckChecked(),
        checkDisabled: this.getCheckDisabled(),
        tag: "paddings"
      });
    if (this.paddingsControl) {
      const paddings = (styles.style["padding"] || "0 0 0 0").split(" ");
      this.propsEditor.add_control("padding_left", "", { datalen: 5, data: (paddings[3] || "").replace("cm", "") });
      this.propsEditor.add_control("/v");
      this.propsEditor.add_control("padding_top", "", { datalen: 5, data: (paddings[0] || "").replace("cm", "") });
      this.propsEditor.add_control("padding_bottom", "", { datalen: 5, data: (paddings[2] || "").replace("cm", "") });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("padding_right", "", { datalen: 5, data: (paddings[1] || "").replace("cm", "") });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }

    this.alignmentsControl = this.propsEditor.add_control("/v", "Aligments");
    if (this.alignmentsControl) {
      const hAlignment = { "left": "Left", "center": "Center", "right": "Right", "justify": "Justify" }[styles.style["text-align"]] || "";
      const vAlignment = { "top": "Top", "middle": "Middle", "bottom": "Bottom" }[styles.style["vertical-align"]] || "";
      this.propsEditor.add_control("text_align", "Horizontal",
        {
          pic: "Left;Center;Right;Justify",
          control: "radio",
          data: { "left": "Left", "center": "Center", "right": "Right", "justify": "Justify" }[styles.style["text-align"]] || "",
          check: true,
          checkChecked: this.getCheckChecked(),
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("vertical_align", "Vertical",
        {
          pic: "Top;Middle;Bottom",
          control: "radio",
          data: vAlignment,
          check: true,
          checkChecked: this.getCheckChecked(),
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("/");  // close layout
    }


    return this.propsEditor
  }

  getCheckChecked() {
    const { report, selection } = this.props;
    if (selection?.type === "report") return true
    // return (selection?.type === "report")
  }

  getCheckDisabled() {
    const { report, selection } = this.props;
    return (selection?.type === "report")
  }

  getPropsData(style) {
    // Returns an object like: { "font-family": { data: ..., check: ... }, ... }
    // console.log(style)
    const props: any = {};

    Object.keys(defaultStyle).forEach(key => {
      props[key] = {data: defaultStyle[key], check: false}
    })

    if (!style) return props;
    const styleObj = style.style || {};
    const parentObj = style.parentStyle || {};
    const styleKeys = Object.keys(styleObj);
    const parentKeys = Object.keys(parentObj);
    const allKeys = Array.from(new Set([...styleKeys, ...parentKeys]));
    allKeys.forEach(key => {
      if (styleObj && styleObj[key] !== undefined) {
        props[key] = {
          data: styleObj[key],
          check: true
        };
      } else if (parentObj && parentObj[key] !== undefined) {
        props[key] = {
          data: parentObj[key],
          check: false
        };
      } else {
        props[key] = {
          data: "",
          check: false
        };
      }
    });

    props["font-family"].data = props["font-family"].data ? props["font-family"].data : "Arial";
    // props["font-size"].data = props["font-size"].data 
    // ? props["font-size"].data : "12pt");

    return props;
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
