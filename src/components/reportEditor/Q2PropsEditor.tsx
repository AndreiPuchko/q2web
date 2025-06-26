import { Component } from "react";
import { Q2Form, Q2Control } from "../../q2_modules/Q2Form";
import { getStyle } from "./Q2Report";
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
  propsData: {};

  defineUi() {
    const { report, selection } = this.props;
    // Use getStyle to select the correct style object
    let styles: any = getStyle(report, selection);

    // Ensure styles.style and styles.parentStyle are always objects
    styles = {
      style: (styles && styles.style) ? styles.style : {},
      parentStyle: (styles && styles.parentStyle) ? styles.parentStyle : {}
    };

    this.propsEditor = new Q2Form();
    this.propsData = this.getPropsData(styles)
    console.log(this.propsData)


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
          data: (styles.style["font-weight"] || "") === "bold",
          check: true,
          checkChecked: this.propsData["font-weight"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_italic", "Italic",
        {
          control: "check",
          data: (styles.style["font-italic"] || "") != "",
          check: true,
          checkChecked: this.propsData["font-italic"].checked,
          checkDisabled: this.getCheckDisabled(),
        });
      this.propsEditor.add_control("font_underline", "Underline",
        {
          control: "check",
          data: (styles.style["font-underline"] || "") != "",
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
        checkChecked: this.propsData["padding"].checked,
        checkDisabled: this.getCheckDisabled(),
        tag: "paddings"
      });
    if (this.paddingsControl) {
      const paddings = this.propsData["padding"].data.split(" ");
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
    const { report, selection } = this.props;
    return (selection?.type === "report")
  }

  getPropsData(style) {
    // Returns an object like: { "font-family": { data: ..., check: ... }, ... }
    const props: any = {};

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
          checked: true
        };
      } else if (parentObj && parentObj[key] !== undefined) {
        props[key] = {
          data: parentObj[key],
          checked: false
        };
      } else {
        props[key] = {
          data: "",
          checked: false
        };
      }
    });
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
          style={{ fontSize: "12px" }}
        >
          <Form metaData={metaData} />
        </div>
      </div>
    );
  }
}

export default Q2PropsEditor;
