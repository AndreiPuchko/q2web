import { gen } from "generate-mock-data";
import { MdInfo } from "react-icons/md";
import Q2CheckBox from '../components/widgets/CheckBox';
import Q2RadioButton from '../components/widgets/RadioButton';

const datalen = 1000;

const mockData1 = []
for (let x = 0; x < datalen; x++) {
    mockData1.push({
        "cid": x,
        "name": gen(1)[0].firstName,
        "address": gen(1)[0].townCity,
        "pos": Math.round(Math.random(5, 19) * 10),
    })
}

const mockData2 = []
for (let x = 0; x < datalen; x++) {
    mockData2.push({
        "cid": x,
        "name": gen(1)[0].firstName,
        "address": gen(1)[0].townCity,
        "pos": Math.round(Math.random(5, 19) * 10),
    })
}

export default mockData1;

export const columns = [
    { key: "0", "column": "cid", "label": "Id" },
    { key: "1", "column": "name", "label": "Name" },
    { key: "2", "column": "address", "label": "Addresse" },
    { key: "3", "column": "pos", "label": "Position" },
];

const actions = [
    { "label": "/", "icon": "" },
    { "label": "Message", "icon": <MdInfo /> },
]

export var forms: Q2Form[] = [];

class Q2Form {
    key: string;
    columns: any[];
    hasCancelButton: boolean;
    hasOkButton: boolean;
    description: string;
    menubarpath: string;
    menutoolbar: boolean | number;
    title: string;
    type: string;
    icon: string;
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(key: string, title: string, menubarpath: string = "", menutoolbar: boolean | number = false, options: Partial<Q2Form> = {}) {
        this.key = key;
        this.columns = [];
        this.hasCancelButton = false;
        this.hasOkButton = false;
        this.description = "";
        this.menubarpath = menubarpath;
        this.menutoolbar = menutoolbar;
        this.title = title;
        this.type = "form";
        this.icon = "form";
        this.width = 800;
        this.height = 600;
        this.x = 0;
        this.y = 0;

        Object.assign(this, options);
    }

    add_control(column: string, label: string, options: { datalen?: number, stretch?: number, control?: string, valid?: any, data?: any, pic?: string, pi?: string } = {}) {
        const { datalen, stretch, control = 'line', valid = () => true, data = null, pic = '', pi = '' } = options;
        const controlObj = {
            column,
            label,
            datalen,
            stretch,
            control,
            key: this.columns.length > 0 ? this.columns.length.toString() : "0", // Unique key
            valid,
            data,
            pic,
            pi
        };
        this.columns.push(controlObj);
        return true;
    }
}

// Create forms using Q2Form class
const form1 = new Q2Form("datagrid1", "Data Grid1 (excluse)", "File|Data Grid1", 1, {
    columns,
    data: mockData1,
    actions,
    description: "This is a data grid1",
    type: "datagrid",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
forms.push(form1);

const form2 = new Q2Form("datagrid2", "Data Grid2 (common)", "File|Other|Data Grid2", true, {
    columns,
    data: mockData2,
    actions,
    description: "This is a data grid2",
    type: "datagrid",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
forms.push(form2);

const form3 = new Q2Form("datagrid3", "Data Grid2 (common)", "File|Other|Data Grid3", 0, {
    columns,
    data: mockData2,
    actions,
    description: "This is a data grid2",
    type: "datagrid",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
forms.push(form3);

const messageBox = new Q2Form("messagebox", "Message Box 2", "File|About", true, {
    columns: [
        { key: "0", "column": "message", "label": "Message", "value": "Lorem ipsum", "readonly": true, "control": "text" },
        { key: "1", "column": "description", "label": "Description", "value": "This is a Description...", "readonly": true, "control": "text" },
    ],
    data: [],
    actions,
    description: "This is a data grid2",
    type: "datagrid",
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    hasOkButton: true
});
forms.push(messageBox);

// Example usage:
const exampleForm = new Q2Form("Layouts", "Example Form", "Example|Layouts form", true, {
    description: "This is an example form created using Q2Form",
    type: "form",
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

const form4 = new Q2Form("form2", "Example Form", "Example|Form2 - object example", true, {
    description: "This is an example form created using Q2Form",
    type: "form",
    icon: "form",
});


const var6_valid = (form: any) => {
    return form.s.var6 === "333";
}

form4.add_control("var6", "Line input",{valid: var6_valid});
form4.add_control("var7", "Line input2");
form4.add_control("var8", "Checkbox", {control: "check", data: true});	
form4.add_control("var4", "Radio button", { pic: "Red;White;Black", control: "radio", data: "White" });
form4.hasOkButton = true;
forms.push(form4);