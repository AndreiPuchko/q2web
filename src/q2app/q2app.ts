import { Q2Form } from "../q2_modules/Q2Form"
import { fileMenu } from "./FileMenu"
import { Q2ReportEditor } from "../components/reportEditor/Q2ReportEditor"
// import { JsonEditor } from 'json-edit-react'
import { get_report_json, get_data_sets_json } from "../components/reportEditor/test_report"

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
    exampleForm.add_control("var1", "Line input", { datalen: 15, check: 1 });
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
    exampleForm.add_control("var44", "Radio button", { pic: "Red;White", control: "radio", data: "White" });
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

const messageBox1 = new Q2Form("Dev|Tab Bar", "Message Box 1", "messagebox1", { hasOkButton: true, menutoolbar: true });

messageBox1.add_control("/t", "tab1")
messageBox1.add_control("/h", "")
messageBox1.add_control("/v", "")
messageBox1.add_control("i1", "Input 1")
messageBox1.add_control("f4i1", "Input 1")
messageBox1.add_control("f4i1", "Input 1")
messageBox1.add_control("/", "")
messageBox1.add_control("/f", "Form")
messageBox1.add_control("i1", "Input 1")
messageBox1.add_control("i12", "Input 12")

messageBox1.add_control("/t", "tab2")
messageBox1.add_control("i2", "Input 2")
messageBox1.add_control("i22", "Input 22")

messageBox1.add_control("/t", "tab3")
messageBox1.add_control("i3", "Input 3")
messageBox1.add_control("i32", "Input 32")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")

messageBox1.add_control("/f", "-")
messageBox1.add_control("fi1", "F Input 1")
messageBox1.add_control("fi12", "F Input 12")

const messageBox2 = new Q2Form("Dev|2", "Message Box 2", "messagebox2", {
    columns: [
        { key: "0", column: "message", label: "Message2", data: "Lorem ipsum2", readonly: true, control: "text" },
    ],
    hasOkButton: true
});

const reportEditor = new Q2Form("Dev|Report Editor", "Report Editor Dialog Demo", "redemo",
    {
        hasOkButton: true,
        menutoolbar: true
    });

// reportEditor.add_control("/h")
reportEditor.add_control("repo", "", { control: "widget", data: { widget: Q2ReportEditor, props: { q2report: get_report_json(), data_set: get_data_sets_json() } } })
// reportEditor.add_control("/t", "Data")
// const jsonData = get_data_sets_json();
// reportEditor.add_control("data", "", { control: "widget", data: { widget: JsonEditor, props: { data: jsonData } } });

q2forms.push(reportEditor);
q2forms.push(new Q2Form("Dev|-"));
q2forms.push(messageBox1);
q2forms.push(messageBox2);

const data_set = get_data_sets_json()["cursor"];
const dataGrid = new Q2Form("Grid|Open Grid (old)", "DataGrid", "", { menutoolbar: true, data: data_set })

dataGrid.add_control("data1", "Text data")
dataGrid.add_control("num1", "Num data")
dataGrid.add_control("grp", "Group data 1")
dataGrid.add_control("tom", "Group data 2")

q2forms.push(dataGrid);


const dataGrid2 = new Q2Form("Grid|Open Grid (new)", "DataGrid2", "", { menutoolbar: true })
// dataGrid2.add_control("/v", "")
// dataGrid2.add_control("txt", "", { control: "text", data: "12" })
dataGrid2.add_control("datagrid", "", { control: "form", data: dataGrid })
q2forms.push(dataGrid2);
