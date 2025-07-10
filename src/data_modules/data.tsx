import { gen } from "generate-mock-data";
import { MdInfo } from "react-icons/md";
import { Q2Form } from "../q2_modules/Q2Form"

const datalen = 1000;

function getRandomInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

const mockData1 = []
for (let x = 0; x < datalen; x++) {
    mockData1.push({
        "cid": x,
        "name": gen(1)[0].firstName,
        "address": gen(1)[0].townCity,
        "pos": Math.round(getRandomInt(5, 19) * 10),
    })
}

const mockData2 = []
for (let x = 0; x < datalen; x++) {
    mockData2.push({
        "cid": x,
        "name": gen(1)[0].firstName,
        "address": gen(1)[0].townCity,
        "pos": Math.round(getRandomInt(5, 19) * 10),
    })
}

export default mockData1;

export const columns = [
    { key: "0", "column": "cid", "label": "Id" },
    { key: "1", "column": "name", "label": "Name" },
    { key: "2", "column": "address", "label": "Addresse" },
    { key: "3", "column": "pos", "label": "Position" },
];

const actions1 = [
    { "label": "/", "icon": "" },
    { "label": "Message", "icon": <MdInfo /> },
]

export const forms: Q2Form[] = [];


// Create forms using Q2Form class
const form1 = new Q2Form("Tables|Data Grid1", "Data Grid1", "datagrid1", {
    columns,
    data: mockData1,
    actions: actions1,
    description: "This is a data grid1",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
forms.push(form1);

const form2 = new Q2Form("Tables|Other|Data Grid2", "Data Grid2", "datagrid2", {
    columns,
    data: mockData2,
    actions: actions1,
    description: "This is a data grid2",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
forms.push(form2);

const form3 = new Q2Form("Tables|Other|Data Grid3", "Data Grid3", "datagrid3", {
    columns,
    data: mockData2,
    actions: actions1,
    description: "This is a data grid2",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
forms.push(form3);

const messageBox = new Q2Form("Tables|About", "Message Box 2", "messagebox", {
    columns: [
        { key: "0", "column": "message", "label": "Message", "value": "Lorem ipsum", "readonly": true, "control": "text" },
        { key: "1", "column": "description", "label": "Description", "value": "This is a Description...", "readonly": true, "control": "text" },
    ],
    data: [],
    description: "This is a data grid2",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    hasOkButton: true
});
forms.push(messageBox);

// Example usage:
const exampleForm = new Q2Form("Examples|Layouts form", "Example Form", "Layouts", {
    description: "This is an example form created using Q2Form",
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
    exampleForm.add_control("/");
}
exampleForm.add_control("var4", "Radio button", { pic: "Red;White", control: "radio", data: "White", pi: "some_pi_value" });
exampleForm.hasCancelButton = true;
forms.push(exampleForm);

const form4 = new Q2Form("Examples|Form2", "Example Form 2", "form2", {
    description: "This is an example form created using Q2Form",
    icon: "form",
});


const var6_valid = (form: any) => {
    return form.s.var6 === "333";
}

form4.add_control("var6", "Line input", { valid: var6_valid });
form4.add_control("var7", "Line input2");
form4.add_control("var8", "Checkbox", { control: "check", data: true });
form4.add_control("var4", "Radio button", { pic: "Red;White;Black", control: "radio", data: "White" });
form4.hasOkButton = true;
forms.push(form4);