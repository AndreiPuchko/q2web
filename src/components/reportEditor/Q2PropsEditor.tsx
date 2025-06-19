import { Component } from "react";
import { Q2Form, Q2Control } from "../../q2_modules/Q2Form";
import Form from '../Form';
import { checkPrime } from "crypto";


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

    console.log(selection)

    this.propsEditor = new Q2Form("", "PropsEditor", "propsEditor", {
      description: "",
      menutoolbar: false,
      icon: "form",
      width: 800,
      height: 600,
      x: 0,
      y: 0
    });

    if (this.propsEditor.add_control("/f", "Font")) {
      this.propsEditor.add_control("font_family", "Font family", { datalen: 15, check: true });
      this.propsEditor.add_control("font_size", "Font size", { datalen: 3, check: true });
      this.propsEditor.add_control("font_weight", "Bold", { control: "check", data: true, check: true });
      this.propsEditor.add_control("font_italic", "Italic", { control: "check", data: true, check: true });
      this.propsEditor.add_control("font_underline", "Unterline", { control: "check", data: true, check: true });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");
    }
    this.bordersControl = this.propsEditor.add_control("/h", "Borders", { alignment: 4, check: true, checked: false });
    if (this.bordersControl) {
      this.propsEditor.add_control("border_left", "", { datalen: 3 });
      this.propsEditor.add_control("/v", "");
      this.propsEditor.add_control("border_top", "", { datalen: 3 });
      this.propsEditor.add_control("border_bottom", "", { datalen: 3 });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("border_right", "", { datalen: 3 });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }
    this.paddingsControl = this.propsEditor.add_control("/h", "Paddings", { alignment: 4, check: true });
    if (this.paddingsControl) {
      this.propsEditor.add_control("padding_left", "", { datalen: 5 });
      this.propsEditor.add_control("/v", "", { datalen: 6 });
      this.propsEditor.add_control("padding_top", "", { datalen: 5 });
      this.propsEditor.add_control("padding_bottom", "", { datalen: 5 });
      this.propsEditor.add_control("/");  // close layout
      this.propsEditor.add_control("padding_right", "", { datalen: 5 });
      this.propsEditor.add_control("/s", "");
      this.propsEditor.add_control("/");  // close layout
    }
    this.alignmentsControl = this.propsEditor.add_control("/v", "Aligments");
    if (this.alignmentsControl) {
      this.propsEditor.add_control("text_align", "Horizontal", { pic: "Left;Center;Right;Justify", control: "radio", data: 1, check: true });
      this.propsEditor.add_control("vertical_align", "Vertical", { pic: "Top;Middle;Bottom", control: "radio", data: 2, check: true });
      this.propsEditor.add_control("/");  // close layout
    }


    return this.propsEditor
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
