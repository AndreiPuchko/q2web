import Q2App from './q2_modules/Q2App';
import { Q2Form } from './q2_modules/Q2Form';
import './App.css';



function App() {
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
  fileMenuDialog.add_control("text", "Label 1",
    { readonly: true, data: "text1", control: "text" });
  fileMenuDialog.add_control("text", "Label 2",
    { readonly: true, data: "text2", control: "text" });

  fileMenu.push(fileMenuAbout)
  fileMenu.push(fileMenuDialog)

  return <Q2App q2forms={fileMenu} />;
}

export default App;
