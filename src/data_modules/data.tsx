import { gen } from "generate-mock-data";

const datalen = 1000;

const mockData = []
for (let x = 0; x < datalen; x++) {
    mockData.push({
        "cid": x,
        "name": gen(1)[0].firstName,
        "address": gen(1)[0].townCity,
        "pos": Math.round(Math.random(5, 19) * 10),
    })
}

export default mockData;

export const columns = [
    { key: "0", "column": "cid", "label": "Id" },
    { key: "1", "column": "name", "label": "Name" },
    { key: "2", "column": "address", "label": "Addresse" },
    { key: "3", "column": "pos", "label": "Position" },
];


export var forms = {};

forms["datagrid1"] = {
    "columns": columns,
    "data": mockData,
    "title": "Data Grid1",
    "description": "This is a data grid1",
    "type": "datagrid",
    "icon": "grid",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
};

forms["datagrid2"] = {
    "columns": columns,
    "data": mockData,
    "title": "Data Grid2",
    "description": "This is a data grid2",
    "type": "datagrid",
    "icon": "grid",
    "width": 800,
    "height": 600,
    "x": 0,
    "y": 0,
};