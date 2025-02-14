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
    { key: "0", "label": "New", "icon": <MdOutlineCropPortrait /> },
    { key: "1", "label": "Copy", "icon": <MdOutlineContentCopy /> },
    { key: "2", "label": "Edit", "icon": <MdEdit /> },
    { key: "3", "label": "Delete", "icon": <MdClose /> },
    { key: "5", "label": "/", "icon": "" },
    { key: "6", "label": "Message", "icon": <MdInfo /> },
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