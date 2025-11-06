import Q2App from './q2_modules/Q2App';
import { Q2Form } from './q2_modules/Q2Form';

import './App.css';
import { GetQ2AppInstance } from './q2_modules/Q2Api';



function App() {

  async function testButoonClick() {
    Q2App.instance?.showDialog(fileMenuAbout)
  }

  const fileMenu: Q2Form[] = [];

  const fileMenuAbout = new Q2Form("File|About", "About", "about",
    {
      menutoolbar: true,
      hasMaxButton: false,
      hasOkButton: true,
    });
  fileMenuAbout.add_control("/v");
  fileMenuAbout.add_control("text", "About",
    { readonly: true, data: "q2-web (React)", control: "text" });

  const fileMenuDialog = new Q2Form("File|Dialog", "Settings", "dialog",
    {
      menutoolbar: true,
      // hasMaxButton: false,
      hasOkButton: true,
      key: "autorun",
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


  const datalistForm = new Q2Form("", "", "");

  // datalistForm.dataGridParams.resizeColumns = false;
  // datalistForm.dataGridParams.reorderColumns = false;
  // datalistForm.dataGridParams.showHeaders = false;

  datalistForm.add_control("c1", "Header1");
  datalistForm.add_control("c2", "Header2");
  datalistForm.data = [
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
  ];


  fileMenuDialog.add_control("list1", "List 1",
    {
      control: "list",
      data: datalistForm,
    });


  fileMenuDialog.add_control("/")
  fileMenuDialog.add_control("/h", "", { alignment: 5 })

  fileMenuDialog.add_control("test2", "test button2",
    { control: "button", valid: testButoonClick });

  fileMenuDialog.add_control("test3", "test button3",
    { control: "button", valid: () => Q2App.instance?.showMsg("Message Box Example") });

  fileMenuDialog.hookSubmit = () => {
    const msgForm = GetQ2AppInstance()?.showMsg("333", "2");
    if (msgForm) {
      setTimeout(() => {
        msgForm.closeDialog()
      }, 3000);
    }

    const msgForm2 = GetQ2AppInstance()?.showMsg("555555", "1");
    msgForm2.setCssText(".Panel {background: red}")
    if (msgForm2) {
      setTimeout(() => {
        msgForm2.closeDialog()
        msgForm2.setCssText(".Panel {background: red}")
      }, 5000);
    }


    return false
  }


  fileMenu.push(fileMenuAbout)
  fileMenu.push(fileMenuDialog)
  // fileMenu.push(msgBox)

  return <Q2App q2forms={fileMenu} />;
}

export default App;
