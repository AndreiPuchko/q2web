import { Q2Form } from "../q2_modules/Q2Form"
import {fileMenuAbout, fileMenuSettings, fileMenu} from "./fileMenu"
export const q2forms: Q2Form[] = [];

const exampleForm = new Q2Form("Refs|LayoutForm", "Example Form", "layouts", {
    description: "This is an example form created using Q2Form",
    menutoolbar: true,
    icon: "form",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
if (exampleForm.add_control("/v", "Vertical layout")) {
    exampleForm.add_control("var1", "Line input", { datalen: 15 });
    exampleForm.add_control("var2", "Line input");

    if (exampleForm.add_control("/h", "Horizontal layout")) {
        exampleForm.add_control("var3", "Line input");
        exampleForm.add_control("var4", "Line input", { stretch: 2 });  // stretch factor!
        exampleForm.add_control("/");  // close layout
    }
    if (exampleForm.add_control("/h", "Next horizontal layout")) {
        if (exampleForm.add_control("/f", "Form layout", { stretch: 4 })) {
            exampleForm.add_control("var5", "Checkbox", { control: "check", data: true });
            exampleForm.add_control("var6", "Line input", { datalen: 10 });
            exampleForm.add_control("var7", "Line input");
            exampleForm.add_control("/");
        }
        if (exampleForm.add_control("/f", "Next form layout", { stretch: 2 })) {
            exampleForm.add_control("var8", "Line input");
            exampleForm.add_control("var9", "Line input");
            exampleForm.add_control("/");
        }
        exampleForm.add_control("/");

    }
    exampleForm.add_control("var44", "Radio button", { pic: "Red;White", control: "radio", data: "White", pi: "some_pi_value" });
}

exampleForm.hasCancelButton = true;

const messageBox = new Q2Form("Refs|MessageBox", "Message Box 2", "messagebox", {
    columns: [
        { key: "0", column: "message", label: "Message", data: "Lorem ipsum", readonly: true, control: "text" },
        { key: "1", column: "description", label: "Description", data: "This is a Description...", readonly: true, control: "text" },
    ],
    data: [],
    description: "This is a data grid2",
    menutoolbar: true,
    hasMaxButton: false,
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    hasOkButton: true
});



q2forms.push(...fileMenu);

q2forms.push(exampleForm);
q2forms.push(new Q2Form("Refs|-"));
q2forms.push(messageBox);



const messageBox1 = new Q2Form("1|1", "Message Box 1", "messagebox1", {
    columns: [
        { key: "0", column: "message", label: "Message1", data: "Lorem ipsum1", readonly: true, control: "text" },
    ],
    hasOkButton: true
});

const messageBox2 = new Q2Form("1|2", "Message Box 2", "messagebox2", {
    columns: [
        { key: "0", column: "message", label: "Message2", data: "Lorem ipsum2", readonly: true, control: "text" },
    ],
    hasOkButton: true
});

const messageBox0 = new Q2Form("1|0000000000000000", "Message Box 0", "messagebox0", {
    columns: [
        { key: "0", column: "message1", label: "", data: messageBox1, control: "form" },
        { key: "1", column: "message2", label: "", data: messageBox2, control: "form" },
    ],
    hasOkButton: true,
    menutoolbar: true
});


q2forms.push(messageBox1);
q2forms.push(messageBox2);
q2forms.push(messageBox0);