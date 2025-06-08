import { Q2Form } from "../q2_modules/Q2Form"


export const fileMenuSettings = new Q2Form("File|Settings", "Settings", "settings", {
    menutoolbar: true,
    hasMaxButton: false,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    hasOkButton: true,
    hasCancelButton: true
});


fileMenuSettings.add_control("colorTheme", "Radio button", { pic: "System;Dark;Light", control: "radio", data: "System" });


export const fileMenuAbout = new Q2Form("File|About", "Settings", "about", {
    menutoolbar: true,
    hasMaxButton: false,
    hasOkButton: true,
});
fileMenuAbout.add_control("text", "", { readonly: true,  value: "Q2App framework", control: "text" });


export const fileMenu: Q2Form[] = [];

fileMenu.push(fileMenuAbout)
fileMenu.push(new Q2Form("File|-"));
fileMenu.push(fileMenuSettings)
