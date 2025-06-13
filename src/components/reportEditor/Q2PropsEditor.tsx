import { Component } from "react";
import { Q2Form } from "../../q2_modules/Q2Form";
import Form from '../Form';


class Q2PropsEditor extends Component {

  defineUi() {
    const propEditor = new Q2Form("Refs|LayoutForm", "Example Form", "layouts", {
      description: "This is an example form created using Q2Form",
      menutoolbar: true,
      icon: "form",
      width: 800,
      height: 600,
      x: 0,
      y: 0
    });

    if (propEditor.add_control("/f", "Font")) {
      propEditor.add_control("font_family", "Font family", { datalen: 15, check: true });
      propEditor.add_control("font_size", "Font size", { datalen: 3, check: true });
      propEditor.add_control("font_weight", "Bold", { control: "check", data: true, check: true });
      propEditor.add_control("font_italic", "Italic", { control: "check", data: true, check: true });
      propEditor.add_control("font_underline", "Unterline", { control: "check", data: true, check: true });
      propEditor.add_control("/s", "");
      propEditor.add_control("/");
    }
    if (propEditor.add_control("/h", "Borders", { alignment: 4, check: true })) {
      propEditor.add_control("border_left", "", { datalen: 3 });
      propEditor.add_control("/v", "");
      propEditor.add_control("border_top", "", { datalen: 3 });
      propEditor.add_control("border_bottom", "", { datalen: 3 });
      propEditor.add_control("/");  // close layout
      propEditor.add_control("border_right", "", { datalen: 3 });
      propEditor.add_control("/s", "");
      propEditor.add_control("/");  // close layout
    }
    if (propEditor.add_control("/h", "Paddings", { alignment: 4, check: true })) {
      propEditor.add_control("padding_left", "", { datalen: 5 });
      propEditor.add_control("/v", "", { datalen: 6 });
      propEditor.add_control("padding_top", "", { datalen: 5 });
      propEditor.add_control("padding_bottom", "", { datalen: 5 });
      propEditor.add_control("/");  // close layout
      propEditor.add_control("padding_right", "", { datalen: 5 });
      propEditor.add_control("/s", "");
      propEditor.add_control("/");  // close layout
    }
    if (propEditor.add_control("/v", "Aligments", { alignment: 8 })) {
      propEditor.add_control("text_align", "Horizontal", { pic: "Left;Center;Right;Justify", control: "radio", data: 1, check: true });
      propEditor.add_control("vertical_align", "Vertical", { pic: "Top;Middle;Bottom", control: "radio", data: 2, check: true });
      propEditor.add_control("/");  // close layout
    }


    return propEditor
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
