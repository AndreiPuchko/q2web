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
      exampleForm.add_control("font_size", "Font size");
      exampleForm.add_control("font_weight", "Font wight", { control: "check", data: true });
      exampleForm.add_control("/");

      if (exampleForm.add_control("/h", "Borders")) {
        exampleForm.add_control("var3", "");
        exampleForm.add_control("/v", "");
        exampleForm.add_control("var3", "");
        exampleForm.add_control("var3", "");
        exampleForm.add_control("/");  // close layout
        exampleForm.add_control("var4", "");
        exampleForm.add_control("/");  // close layout
      }
      if (exampleForm.add_control("/h", "Paddings")) {
        exampleForm.add_control("var3", "");
        exampleForm.add_control("/v", "");
        exampleForm.add_control("var3", "");
        exampleForm.add_control("var3", "");
        exampleForm.add_control("/");  // close layout
        exampleForm.add_control("var4", "");
        exampleForm.add_control("/");  // close layout
      }
      if (exampleForm.add_control("/h", "Aligments")) {
        exampleForm.add_control("var3", "");
        exampleForm.add_control("/v", "");
        exampleForm.add_control("var3", "");
        exampleForm.add_control("var3", "");
        exampleForm.add_control("/");  // close layout
        exampleForm.add_control("var4", "", );
        exampleForm.add_control("/");  // close layout
      }      
      exampleForm.add_control("var44", "Radio button", { pic: "Red;White", control: "radio", data: "White", pi: "some_pi_value" });
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
            fontSize: "10px",
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
