import { Component } from "react";
import { Q2Form, Q2Control } from "../../q2_modules/Q2Form";
import Form from '../Form';

interface StyleProps {
  selection: any;
  q2report: any;
  reportEditor: any;
}

class Q2StyleEditor extends Component<StyleProps> {
  bordersControl: Q2Control;
  paddingsControl: Q2Control;
  alignmentsControl: Q2Control;
  propsEditor: Q2Form;
  propsData: { [key: string]: number | string | boolean };

  defineUi() {
    // const { selection } = this.props;
    // Use getStyle to select the correct style object
    this.propsData = this.getStyleData()

    this.propsEditor = new Q2Form();

    if (this.propsEditor.add_control("/f", "Font")) {

      this.propsEditor.add_control("font_family", "Font family",
        {
          datalen: 15,
          data: this.propsData["font-family"].data,
          check: true,
          checkChecked: this.propsData["font-family"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_size", "Font size",
        {
          datalen: 3,
          data: this.propsData["font-size"].data,
          check: true,
          checkChecked: this.propsData["font-size"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_weight", "Bold",
        {
          control: "check",
          data: this.propsData["font-weight"].data,
          check: true,
          checkChecked: this.propsData["font-weight"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_italic", "Italic",
        {
          control: "check",
          data: this.propsData["font-italic"].data,
          check: true,
          checkChecked: this.propsData["font-italic"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_underline", "Underline",
        {
          control: "check",
          data: this.propsData["font-underline"].data,
          check: true,
          checkChecked: this.propsData["font-underline"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");
    }


    this.bordersControl = this.propsEditor.add_control("/h", "Borders",
      {
        alignment: 4,
        check: true,
        checkChecked: this.propsData["border-width"].checked,
        checkDisabled: this.getCheckDisabled(),
        tag: "borders"
      });
    if (this.bordersControl) {
      const borders = this.propsData["border-width"].data.split(" ");
      this.propsEditor.add_control("border_left", "", { datalen: 3, datatype: "int", data: borders[3] || "" });
      this.propsEditor.add_control("/v", "");
      this.propsEditor.add_control("border_top", "", { datalen: 3, datatype: "int", data: borders[0] || "" });
      this.propsEditor.add_control("border_bottom", "", { datalen: 3, datatype: "int", data: borders[2] || "" });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("border_right", "", { datalen: 3, datatype: "int", data: borders[1] || "" });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }

    this.paddingsControl = this.propsEditor.add_control("/h", "Paddings",
      {
        alignment: 4,
        check: true,
        checkChecked: this.propsData["padding"].checked,
        checkDisabled: this.getCheckDisabled(),
        tag: "paddings"
      });
    if (this.paddingsControl) {
      const paddings = this.propsData["padding"].data.split(" ");
      this.propsEditor.add_control("padding_left", "", { datalen: 5, datatype: "dec", datadec: 2, range: "0", data: (paddings[3] || "").replace("cm", "") });
      this.propsEditor.add_control("/v");
      this.propsEditor.add_control("padding_top", "", { datalen: 5, datatype: "dec", datadec: 2, range: "0", data: (paddings[0] || "").replace("cm", "") });
      this.propsEditor.add_control("padding_bottom", "", { datalen: 5, datatype: "dec", datadec: 2, range: "0", data: (paddings[2] || "").replace("cm", "") });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("padding_right", "", { datalen: 5, datatype: "dec", datadec: 2, range: "0", data: (paddings[1] || "").replace("cm", "") });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }

    this.alignmentsControl = this.propsEditor.add_control("/v", "Aligments");
    if (this.alignmentsControl) {
      const hAlignment = { "left": "Left", "center": "Center", "right": "Right", "justify": "Justify" }[this.propsData["text-align"].data];
      const vAlignment = { "top": "Top", "middle": "Middle", "bottom": "Bottom" }[this.propsData["vertical-align"].data];
      this.propsEditor.add_control("text_align", "Horizontal",
        {
          pic: "Left;Center;Right;Justify",
          control: "radio",
          data: hAlignment,
          check: true,
          checkChecked: this.propsData["text-align"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("vertical_align", "Vertical",
        {
          pic: "Top;Middle;Bottom",
          control: "radio",
          data: vAlignment,
          check: true,
          checkChecked: this.propsData["vertical-align"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("/");  // close layout
    }


    return this.propsEditor
  }

  getCheckDisabled() {
    const { selection } = this.props;
    return (selection?.type === "report")
  }

  getStyleData() {
    // Returns an object like: { "font-family": { data: ..., check: ... }, ... }
    const { q2report, selection } = this.props;
    const styles: any = q2report.getStyle(selection);
    const props: any = {};
    if (!styles) return props;
    const selectionStyle = styles.style || {};
    const parentStyle = styles.parentStyle || {};
    const selectionKeys = Object.keys(selectionStyle);
    const parentKeys = Object.keys(parentStyle);
    const allKeys = Array.from(new Set([...selectionKeys, ...parentKeys]));
    allKeys.forEach(key => {
      if (selectionStyle && selectionStyle[key] !== undefined) {
        props[key] = {
          data: selectionStyle[key],
          checked: parentStyle[key] != selectionStyle[key]
        };
      } else if (parentStyle && parentStyle[key] !== undefined) {
        props[key] = {
          data: parentStyle[key],
          checked: false
        };
      }
      // else {
      //   props[key] = {
      //     data: "",
      //     checked: false
      //   };
      // }
    });
    return props;
  }

  collectStyle(form) {
    // Collect style values from the current form (this.propsEditor.s)
    // Returns an object like: { "font-family": value, ... }
    const style: any = {};
    const s = form?.s || {};
    const w = form?.w || {};
    // Font
    if ("font_family" in s) style["font-family"] = s.font_family;
    if ("font_size" in s) style["font-size"] = s.font_size;
    if ("font_weight" in s) style["font-weight"] = s.font_weight;
    if ("font_italic" in s) style["font-italic"] = s.font_italic;
    if ("font_underline" in s) style["font-underline"] = s.font_underline;
    // Borders
    if ("border_left" in s || "border_top" in s || "border_right" in s || "border_bottom" in s) {
      style["border-width"] = [
        s.border_top ?? "",
        s.border_right ?? "",
        s.border_bottom ?? "",
        s.border_left ?? ""
      ].join(" ");
    }
    // Paddings
    if ("padding_left" in s || "padding_top" in s || "padding_right" in s || "padding_bottom" in s) {
      style["padding"] = [
        (s.padding_top ?? "") + "cm",
        (s.padding_right ?? "") + "cm",
        (s.padding_bottom ?? "") + "cm",
        (s.padding_left ?? "") + "cm"
      ].join(" ");
    }
    // Alignments
    if ("text_align" in s) {
      // Map UI value to CSS value
      const mapH = { "Left": "left", "Center": "center", "Right": "right", "Justify": "justify" };
      style["text-align"] = mapH[s.text_align] ?? s.text_align;
    }
    if ("vertical_align" in s) {
      const mapV = { "Top": "top", "Middle": "middle", "Bottom": "bottom" };
      style["vertical-align"] = mapV[s.vertical_align] ?? s.vertical_align;
    }
    return style;
  }

  setData(sel?: any, style?: any) {
    // console.log("set data", sel, style);
  }

  render() {
    this.defineUi()
    const { q2report, selection, reportEditor } = this.props;
    this.propsEditor.hookInputChanged = (form) => {
      console.log("--", this.collectStyle(form))
    }

    return (
      <div>
        <div
          style={{ fontSize: "12px" }}
        >
          <Form q2form={this.propsEditor} />
        </div>
      </div>
    );
  }
}

export default Q2StyleEditor;
