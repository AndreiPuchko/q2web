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

export var forms = {};

forms["datagrid1"] = {
    "key": "datagrid1",
    "columns": columns,
    "data": mockData1,
    "menubarpath": "File|Data Grid1",
    "menutoolbar": 1,
    "actions": actions,
    "title": "Data Grid1 (excluse)",
    "description": "This is a data grid1",
    "type": "datagrid",
    "icon": "grid",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
};

forms["datagrid2"] = {
    "key": "datagrid2",
    "columns": columns,
    "data": mockData2,
    "menubarpath": "File|Other|Data Grid2",
    "menutoolbar": true,
    "actions": actions,
    "title": "Data Grid2 (common)",
    "description": "This is a data grid2",
    "type": "datagrid",
    "icon": "grid",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
};

forms["datagrid3"] = {
    "key": "datagrid3",
    "columns": columns,
    "data": mockData2,
    "menubarpath": "File|Other|Data Grid3",
    "menutoolbar": 0,
    "actions": actions,
    "title": "Data Grid2 (common)",
    "description": "This is a data grid2",
    "type": "datagrid",
    "icon": "grid",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
};


forms["messageBox"] = {
    "key": "messagebox",
    "columns": [
        { key: "0", "column": "message", "label": "Message", "value": "This is a message box", "readonly": true, "control": "text" },
        { key: "1", "column": "description", "label": "Description", "value": "This is a Description...", "readonly": true, "control": "text" },
    ],
    "data": [],
    "menubarpath": "File|About",
    "menutoolbar": true,
    "actions": actions,
    "title": "Message Box 2",
    "description": "This is a data grid2",
    "type": "datagrid",
    "icon": "grid",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
    "hasokbutton": true,
};

class Q2Form {
    key: string;
    columns: any[];
    hasCancelButton: boolean;

    constructor(key: string) {
        this.key = key;
        this.columns = [];
        this.hasCancelButton = false;
    }

    add_control(type: string, label?: string, datalen?: number, stretch?: number) {
        const control = { type, label, datalen, stretch };
        this.columns.push(control);
        return true;
    }
}

// Example usage:
const form = new Q2Form("Layouts");
form.add_control("/");  // close default form layout
if (form.add_control("/v", "Vertical layout")) {
    form.add_control("var1", "Line input", 15);
    form.add_control("var2", "Line input");

    if (form.add_control("/h", "Horizontal layout")) {
        form.add_control("var3", "Line input");
        form.add_control("var4", "Line input", undefined, 2);  // stretch factor!
        form.add_control("/");  // close layout
    }
    if (form.add_control("/h", "Next horizontal layout")) {
        if (form.add_control("/f", "Form layout", undefined, 4)) {
            form.add_control("var5", "Line input", 10);
            form.add_control("var6", "Line input");
            form.add_control("/");
        }
        if (form.add_control("/f", "Next form layout", undefined, 2)) {
            form.add_control("var7", "Line input");
            form.add_control("var8", "Line input");
            form.add_control("/");
        }
        form.add_control("/");
    }
    form.add_control("/");
}

form.hasCancelButton = true;

forms["exampleForm"] = {
    "key": form.key,
    "columns": form.columns,
    "description": "This is an example form created using Q2Form",
    "menubarpath": "File|Layouts form",
    "menutoolbar": true,	
    "hasCancelButton": form.hasCancelButton,
    "title": "Example Form",
    "type": "form",
    "icon": "form",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
}
;
const form2 = new Q2Form("Layouts");
form2.add_control("var6", "Line input");
form2.hasCancelButton = true;

forms["form2"] = {
    "key": form2.key,
    "columns": form2.columns,
    "hasCancelButton": form2.hasCancelButton,
    "title": "Example Form",
    "description": "This is an example form created using Q2Form",
    "menubarpath": "File|Form2 - object example",
    "menutoolbar": true,
    "type": "form",
    "icon": "form",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
};