import { gen } from "generate-mock-data";
import { MdAdd, MdEdit, MdContentCopy, MdDelete, MdMessage, MdExitToApp, MdViewQuilt, MdInfo, MdRemove, MdContactPage, MdCropPortrait, MdOutlineCropPortrait, MdOutlineContentCopy, MdOutlinePlaylistRemove, MdClose } from "react-icons/md";

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

    constructor(key: string) {
        this.key = key;
        this.columns = [];
        this.hasCancelButton = false;
        this.hasOkButton = false;
        this.description = "";
        this.menubarpath = "";
        this.menutoolbar = false;
        this.title = "";
        this.type = "form";
        this.icon = "form";
        this.width = 800;
        this.height = 600;
        this.x = 0;
        this.y = 0;
    }

    add_control(type: string, label?: string, datalen?: number, stretch?: number) {
        const control = { type, label, datalen, stretch };
        this.columns.push(control);
        return true;
    }
}

// Create forms using Q2Form class
const form1 = new Q2Form("datagrid1");
form1.columns = columns;
form1.data = mockData1;
form1.menubarpath = "File|Data Grid1";
form1.menutoolbar = 1;
form1.actions = actions;
form1.title = "Data Grid1 (excluse)";
form1.description = "This is a data grid1";
form1.type = "datagrid";
form1.icon = "grid";
form1.width = 800;
form1.height = 600;
form1.x = 0;
form1.y = 0;
forms.push(form1);

const form2 = new Q2Form("datagrid2");
form2.columns = columns;
form2.data = mockData2;
form2.menubarpath = "File|Other|Data Grid2";
form2.menutoolbar = true;
form2.actions = actions;
form2.title = "Data Grid2 (common)";
form2.description = "This is a data grid2";
form2.type = "datagrid";
form2.icon = "grid";
form2.width = 800;
form2.height = 600;
form2.x = 0;
form2.y = 0;
forms.push(form2);

const form3 = new Q2Form("datagrid3");
form3.columns = columns;
form3.data = mockData2;
form3.menubarpath = "File|Other|Data Grid3";
form3.menutoolbar = 0;
form3.actions = actions;
form3.title = "Data Grid2 (common)";
form3.description = "This is a data grid2";
form3.type = "datagrid";
form3.icon = "grid";
form3.width = 800;
form3.height = 600;
form3.x = 0;
form3.y = 0;
forms.push(form3);

const messageBox = new Q2Form("messagebox");
messageBox.columns = [
    { key: "0", "column": "message", "label": "Message", "value": "This is a message box", "readonly": true, "control": "text" },
    { key: "1", "column": "description", "label": "Description", "value": "This is a Description...", "readonly": true, "control": "text" },
];
messageBox.data = [];
messageBox.menubarpath = "File|About";
messageBox.menutoolbar = true;
messageBox.actions = actions;
messageBox.title = "Message Box 2";
messageBox.description = "This is a data grid2";
messageBox.type = "datagrid";
messageBox.icon = "grid";
messageBox.width = 800;
messageBox.height = 600;
messageBox.x = 0;
messageBox.y = 0;
messageBox.hasOkButton = true;
forms.push(messageBox);

// Example usage:
const exampleForm = new Q2Form("Layouts");
exampleForm.add_control("/");  // close default form layout
if (exampleForm.add_control("/v", "Vertical layout")) {
    exampleForm.add_control("var1", "Line input", 15);
    exampleForm.add_control("var2", "Line input");

    if (exampleForm.add_control("/h", "Horizontal layout")) {
        exampleForm.add_control("var3", "Line input");
        exampleForm.add_control("var4", "Line input", undefined, 2);  // stretch factor!
        exampleForm.add_control("/");  // close layout
    }
    if (exampleForm.add_control("/h", "Next horizontal layout")) {
        if (exampleForm.add_control("/f", "Form layout", undefined, 4)) {
            exampleForm.add_control("var5", "Line input", 10);
            exampleForm.add_control("var6", "Line input");
            exampleForm.add_control("/");
        }
        if (exampleForm.add_control("/f", "Next form layout", undefined, 2)) {
            exampleForm.add_control("var7", "Line input");
            exampleForm.add_control("var8", "Line input");
            exampleForm.add_control("/");
        }
        exampleForm.add_control("/");
    }
    exampleForm.add_control("/");
}

exampleForm.hasCancelButton = true;
exampleForm.hasOkButton = true;
exampleForm.menubarpath = "File|Layouts form";
exampleForm.menutoolbar = true;
exampleForm.title = "Example Form";
exampleForm.description = "This is an example form created using Q2Form";
exampleForm.type = "form";
exampleForm.icon = "form";
exampleForm.width = 800;
exampleForm.height = 600;
exampleForm.x = 0;
exampleForm.y = 0;
forms.push(exampleForm);

const form4 = new Q2Form("form2");
form4.add_control("var6", "Line input");
form4.hasCancelButton = true;
form4.hasOkButton = true;
form4.menubarpath = "File|Form2 - object example";
form4.menutoolbar = true;
form4.title = "Example Form";
form4.description = "This is an example form created using Q2Form";
form4.type = "form";
form4.icon = "form";
form4.width = 800;
form4.height = 600;
form4.x = 0;
form4.y = 0;
forms.push(form4);