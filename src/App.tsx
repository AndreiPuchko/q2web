import Q2App from './q2_modules/Q2App';
import { Q2Form } from './q2_modules/Q2Form';

import './App.css';
import { GetQ2AppInstance } from './q2_modules/Q2Api';



function App() {

  async function testButoonClick() {
    await fileMenuAbout.showDialog();
    await fileMenuAbout.waitForClose();
    console.log("============", fileMenuAbout)
  }

  const fileMenu: any[] = [];

  const fileMenuAbout = new Q2Form("File|About", "About", "about",
    {
      menutoolbar: true,
      hasMaxButton: false,
      hasOkButton: true,
    });
  fileMenuAbout.add_control("/v");
  fileMenuAbout.add_control("text", "About",
    { readonly: false, data: "q2-web (React)", control: "text" });


  const fileMenuFabricFactory = (): Q2Form => {
    const form = new Q2Form("File|Fabric", "F a b r i c", "fabric",
      {
        menutoolbar: true,
        hasMaxButton: false,
        hasOkButton: true,
      });
    form.add_control("/v");
    form.add_control("text", "About",
      { readonly: false, data: "q2-web (React)", control: "text" });
    return form
  }
  const fileMenuDialog = new Q2Form("File|Dialog", "Settings", "dialog",
    {
      menutoolbar: true,
      // hasMaxButton: false,
      hasOkButton: true,
      key: "auto run",
      // frameless: true,
      // resizeable: false,
      // moveable: false,
      // width: "100%",
      // height: "100%",
      // top: "0px",
      // left: "0px",
    });


  fileMenuDialog.add_control("/f");
  fileMenuDialog.add_control("text1", "Label 1",
    { data: "text1", control: "line" });
  fileMenuDialog.add_control("text2", "Label 2",
    { data: "text2", control: "text" });
  fileMenuDialog.add_control("/")
  fileMenuDialog.add_control("/v")


  const factoryDataList = (): Q2Form => {
    const datalistForm = new Q2Form("Data|List", "DataList", "autorun");
    datalistForm.add_control("c1", "Header1");
    datalistForm.add_control("c2", "Header2");
    datalistForm.dataGridParams.loader = async () => {
      return [
        { c1: "01 12", c2: "34" },
        { c1: "02 56", c2: "78" },
        { c1: "03 56", c2: "78" },
        { c1: "04 56", c2: "78" },
        { c1: "05 56", c2: "78" },
        { c1: "06 56", c2: "78" },
        { c1: "07 56", c2: "78" },
        { c1: "08 56", c2: "78" },
        { c1: "09 56", c2: "78" },
        { c1: "10 56", c2: "78" },
        { c1: "11 56", c2: "78" },
        { c1: "12 56", c2: "78" },
        { c1: "13 56", c2: "78" },
        { c1: "14 56", c2: "78" },
        { c1: "15 56", c2: "78" },
        { c1: "16 56", c2: "78" },
        { c1: "17 56", c2: "78" },
        { c1: "18 56", c2: "78" },
        { c1: "19 56", c2: "78" },
        { c1: "20 56", c2: "78" },
      ]
    };
    datalistForm.add_action("New", () => { console.log("new!") }, "new")
    datalistForm.add_action("Copy", () => { console.log("copy!") }, "copy")
    datalistForm.add_action("Edit", () => { console.log("edit!") }, "edit")
    datalistForm.add_action("Delete", () => { console.log("delete!") }, "remove")
    datalistForm.add_action("/", () => { console.log("close!") }, "exit")
    datalistForm.add_action("Close", () => { console.log("close!") }, "exit")
    return datalistForm
  }

  fileMenuDialog.add_control("list1", "List 1",
    {
      control: "list",
      data: factoryDataList,
    });

  fileMenuDialog.add_control("/")
  fileMenuDialog.add_control("/h", "", { alignment: 5 })

  fileMenuDialog.add_control("test2", "test button2",
    { control: "button", valid: testButoonClick });

  fileMenuDialog.add_control("test3", "test button3",
    {
      control: "button",
      valid: async () => {
        const msg = await Q2App.instance?.showMsg("Message Box Example", ["Ok", "Cancel"]);
        if (msg) {
          await msg.waitForClose()
          console.log(msg.payload.button, "<<!")
        }
      }
    });

  fileMenuDialog.add_control("color", "Color", { control: "color" })

  fileMenuDialog.hookSubmit = async () => {
    const msgForm2 = await GetQ2AppInstance()?.showMsg("555555", "1");
    msgForm2?.setCssText(" {background: red;padding: 5px;} .Q2Text:focus, .Q2Text {background:pink}");
    if (msgForm2) {
      await msgForm2.waitForClose();
    }
    return false;
  }

  const messageBox = new Q2Form("Forms|MessageBox", "Message Box 2", "messagebox", {
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

  fileMenu.push(fileMenuAbout)
  fileMenu.push(fileMenuFabricFactory)
  fileMenu.push(fileMenuDialog)
  fileMenu.push(messageBox)
  fileMenu.push(factoryDataList)

  return <Q2App q2forms={fileMenu} />;
}

export default App;
