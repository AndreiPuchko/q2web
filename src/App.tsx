import Q2App from './q2_modules/Q2App';
import { Q2Form } from './q2_modules/Q2Form';

import './App.css';



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
      hasMaxButton: false,
      hasOkButton: true,
    });
  fileMenuDialog.add_control("/f");
  fileMenuDialog.add_control("text1", "Label 1",
    { readonly: true, data: "text1", control: "text" });
  fileMenuDialog.add_control("text2", "Label 2",
    { readonly: true, data: "text2", control: "text" });

  fileMenuDialog.add_control("/")
  fileMenuDialog.add_control("/h", "", { alignment: 5 })

  fileMenuDialog.add_control("test2", "test button2",
    { control: "button", valid: testButoonClick });

  fileMenuDialog.add_control("test3", "test button3",
    { control: "button", valid: () => Q2App.instance?.showMsg("Message Box Example") });


  fileMenu.push(fileMenuAbout)
  fileMenu.push(fileMenuDialog)
  // fileMenu.push(msgBox)

  return <Q2App q2forms={fileMenu} />;
}

export default App;
