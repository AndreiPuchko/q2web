import { Q2Form } from "../q2_modules/Q2Form"


export const fileMenuSettings = new Q2Form("File|Settings", "Settings", "settings", {
    menutoolbar: false,
    hasMaxButton: false,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    hasOkButton: true,
    hasCancelButton: true
});


function colorThemeValid(form: Q2Form){
    // console.log("colorThemeValid", form)
    localStorage.setItem('theme', form.s.colorTheme.toLowerCase());
    window.dispatchEvent(new Event('q2-theme-changed'));
}

fileMenuSettings.add_control("colorTheme", "Color Theme", { pic: "System;Dark;Light", control: "radio", valid: colorThemeValid, data:"Light" });

function tagValid(form: Q2Form){
    console.log("tag:", form.s.tag);
    console.log("tag", localStorage.getItem('theme'), form);
}

fileMenuSettings.add_control("tag", "Text Tag", { control: "line", valid: tagValid, data:"tag value" });


export const fileMenuAbout = new Q2Form("File|About", "Settings", "about", {
    menutoolbar: true,
    hasMaxButton: false,
    hasOkButton: true,
});


fileMenuAbout.add_control("/v");
fileMenuAbout.add_control("text", "", { readonly: true,  data: "Q2App framework", control: "text"});


export const fileMenu: Q2Form[] = [];

fileMenu.push(fileMenuAbout)
fileMenu.push(new Q2Form("File|-"));
fileMenu.push(fileMenuSettings)
