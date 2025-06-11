import { Component } from "react";
import { Q2Form } from "../q2_modules/Q2Form";
import Form from '../components/Form';


class Q2PropsEditor extends Component {

  defineUi() {
    const exampleForm = new Q2Form("Refs|LayoutForm", "Example Form", "layouts", {
      description: "This is an example form created using Q2Form",
      menutoolbar: true,
      icon: "form",
      width: 800,
      height: 600,
      x: 0,
      y: 0
    });

    if (exampleForm.add_control("/f", "Font")) {

      exampleForm.add_control("font_family", "Font family", { datalen: 15 });
      exampleForm.add_control("font_size", "Font size", { datalen: 3 });
      // exampleForm.add_control("/h", "");
      exampleForm.add_control("font_weight", "Bold", { control: "check", data: true, check: true });
      exampleForm.add_control("font_italic", "Italic", { control: "check", data: true, check: true });
      exampleForm.add_control("font_underline", "Unterline", { control: "check", data: true, check: true });
      exampleForm.add_control("/s", "");
      // exampleForm.add_control("/");
      exampleForm.add_control("/");

      if (exampleForm.add_control("/h", "Borders", {alignment:4})) {
        exampleForm.add_control("var3", "", {datalen:6});
        exampleForm.add_control("/v", "");
        exampleForm.add_control("var3", "", {datalen:6});
        exampleForm.add_control("var3", "", {datalen:6});
        exampleForm.add_control("/");  // close layout
        exampleForm.add_control("var4", "", {datalen:6});
        exampleForm.add_control("/s", "");
        exampleForm.add_control("/");  // close layout
      }
      if (exampleForm.add_control("/h", "Paddings", {alignment:4})) {
        exampleForm.add_control("var3", "", {datalen:6});
        exampleForm.add_control("/v", "", {datalen:6});
        exampleForm.add_control("var3", "", {datalen:6});
        exampleForm.add_control("var3", "", {datalen:6});
        exampleForm.add_control("/");  // close layout
        exampleForm.add_control("var4", "", {datalen:6});
        exampleForm.add_control("/s", "");
        exampleForm.add_control("/");  // close layout
      }
      if (exampleForm.add_control("/v", "Aligments", {alignment:8})) {
        exampleForm.add_control("var4", "", { pic: "Left;Center;Right;Justify", control: "radio", data: 1});
        exampleForm.add_control("var4", "", { pic: "Top;Middle;Bottom", control: "radio", data: 2});
        exampleForm.add_control("/");  // close layout
      }      
    }

    return exampleForm
  }

  render() {
    const metaData = this.defineUi()
    return (
      <div>
        <div
          style={{
            background: "",
            color: "black",
            // fontSize: "10px",
            border: "1px solid black",
            marginTop: "50px",
          }}
        >
          <Form metaData={metaData} />
        </div>
      </div>
    );
  }
}

export default Q2PropsEditor;
