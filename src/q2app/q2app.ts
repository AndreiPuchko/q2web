import { Q2Form } from "../q2_modules/Q2Form"
import { fileMenu } from "./FileMenu"
import { Q2ReportEditor } from "../components/reportEditor/Q2ReportEditor"
// import { JsonEditor } from 'json-edit-react'
import { get_report_json, get_data_sets_json, get_report_invoice_json, get_data_sets_invoice_json } from "../components/reportEditor/test_report"

export const q2forms: Q2Form[] = [];

const exampleForm = new Q2Form("Forms|LayoutForm", "Example Form", "layouts", {
    description: "This is an example form created using Q2Form",
    menutoolbar: false,
    icon: "form",
    width: 800,
    height: 600,
    x: 0,
    y: 0
});
if (exampleForm.add_control("/v", "Vertical layout")) {
    exampleForm.add_control("var1", "Line input", { datalen: 15, check: 1 });
    exampleForm.add_control("var2", "Line input");

    if (exampleForm.add_control("/h", "Horizontal layout")) {
        exampleForm.add_control("var3", "Line input");
        exampleForm.add_control("var4", "Line input", { stretch: 2 });  // stretch factor!
        exampleForm.add_control("/");  // close layout
    }
    if (exampleForm.add_control("/h", "Next horizontal layout")) {
        if (exampleForm.add_control("/f", "Form layout", { stretch: 4 })) {
            exampleForm.add_control("var5", "Checkbox", { control: "check", data: true });
            exampleForm.add_control("var6", "Line input", { datalen: 10 });
            exampleForm.add_control("var7", "Line input");
            exampleForm.add_control("/");
        }
        if (exampleForm.add_control("/f", "Next form layout", { stretch: 2 })) {
            exampleForm.add_control("var8", "Line input");
            exampleForm.add_control("var9", "Line input");
            exampleForm.add_control("/");
        }
        exampleForm.add_control("/");

    }
    exampleForm.add_control("var44", "Radio button", { pic: "Red;White", control: "radio", data: "White" });
}

exampleForm.hasCancelButton = true;

const messageBox = new Q2Form("Forms|MessageBox", "Message Box 2", "messagebox", {
    columns: [
        { key: "0", column: "message", label: "Message", data: "Lorem ipsum", readonly: true, control: "text" },
        { key: "1", column: "description", label: "Description", data: "This is a Description...", readonly: true, control: "text" },
    ],
    data: [],
    description: "This is a data grid2",
    menutoolbar: false,
    hasMaxButton: false,
    icon: "grid",
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    hasOkButton: true
});

q2forms.push(...fileMenu);
q2forms.push(exampleForm);
q2forms.push(new Q2Form("Forms|-"));
q2forms.push(messageBox);

const messageBox1 = new Q2Form("Forms|Tab Bar", "Message Box 1", "messagebox1", { hasOkButton: true, menutoolbar: false });

messageBox1.add_control("/t", "tab1")
messageBox1.add_control("/h", "")
messageBox1.add_control("/v", "")
messageBox1.add_control("i1", "Input 1")
messageBox1.add_control("f4i1", "Input 1")
messageBox1.add_control("f4i1", "Input 1")
messageBox1.add_control("/", "")
messageBox1.add_control("/f", "Form")
messageBox1.add_control("i1", "Input 1")
messageBox1.add_control("i12", "Input 12")

messageBox1.add_control("/t", "tab2")
messageBox1.add_control("i2", "Input 2")
messageBox1.add_control("i22", "Input 22")

messageBox1.add_control("/t", "tab3")
messageBox1.add_control("i3", "Input 3")
messageBox1.add_control("i32", "Input 32")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")
messageBox1.add_control("/", "")

messageBox1.add_control("/f", "-")
messageBox1.add_control("fi1", "F Input 1")
messageBox1.add_control("fi12", "F Input 12")

const messageBox2 = new Q2Form("Forms|Message Box 2", "Message Box 2", "messagebox2", {
    columns: [
        { key: "0", column: "message", label: "Message2", data: "Lorem ipsum2", readonly: true, control: "text" },
    ],
    hasOkButton: true
});

const reportEditor = new Q2Form("Report Editor|Test", "Report Editor - Test", "redemo",
    {
        hasOkButton: true,
        menutoolbar: true,
        width: "90%",
        height: "90%",
    });



reportEditor.add_control("repo", "", {
    control: "widget", data: {
        widget: Q2ReportEditor,
        props: { q2report: get_report_json(), data_set: get_data_sets_json() }
    }
})



const reportEditor2 = new Q2Form("Report Editor|Invoice", "Report Editor - Invioice", "autorun",
    {
        hasOkButton: true,
        menutoolbar: true,
        width: "90%",
        height: "90%",
    });
reportEditor2.add_control("repo", "", {
    control: "widget", data: {
        widget: Q2ReportEditor,
        props: { q2report: get_report_invoice_json(), data_set: get_data_sets_invoice_json() }
    }
})

q2forms.push(reportEditor);
q2forms.push(reportEditor2);
q2forms.push(new Q2Form("Report Editor|-"));
q2forms.push(new Q2Form("Report Editor|Python code", "Python code", "usage",
    {
        columns: [
            {
                key: "0", column: "message", label: " ", data: `from q2report import Q2Report
import json

report = Q2Report()
report.load(open(r"Test.json").read())
report.run("result.docx", data=json.load(open(r"Test-data.json")))
`, readonly: true, control: "text"
            },
        ],
        hasOkButton: true
    }
));


q2forms.push(new Q2Form("Report Editor|Runme.bat", "runme.bat", "runme",
    {
        columns: [
            {
                key: "0", column: "message", label: " ", data: `@echo off
setlocal

:: === Check Python ===
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

:: Check Python version
for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PY_VER=%%v
for /f "tokens=1,2 delims=." %%a in ("%PY_VER%") do (
    set MAJOR=%%a
    set MINOR=%%b
)

if %MAJOR% lss 3 (
    echo Python 3.8+ is required, found %PY_VER%
    pause
    exit /b 1
)
if %MAJOR%==3 if %MINOR% lss 8 (
    echo Python 3.8+ is required, found %PY_VER%
    pause
    exit /b 1
)

:: === Check/Create venv ===
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)

:: Activate venv
call .venv\Scripts\activate.bat

:: === Check q2report ===
pip show q2report >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Installing q2report...
    pip install q2report
)

:: === Handle 2 params (report + data file) ===
if "%~1"=="" goto END
if "%~2"=="" goto END

if not exist "%~1" (
    echo File "%~1" not found.
    pause
    exit /b 1
)
if not exist "%~2" (
    echo File "%~2" not found.
    pause
    exit /b 1
)


:: === Write runme.py line by line ===
> runme.py echo from q2report import Q2Report
>> runme.py echo import json
>> runme.py echo.
>> runme.py echo report = Q2Report^()
>> runme.py echo report.load(open(r"%~1").read())
>> runme.py echo report.run("result.docx", data=json.load(open(r"%~2")))

:: Run the script
python runme.py

:END
echo Done.
endlocal

`, readonly: true, control: "text"
            },
        ],
        hasOkButton: true
    }
));


q2forms.push(messageBox1);
q2forms.push(messageBox2);

const data_set = get_data_sets_json()["cursor"];
const dataGrid = new Q2Form("Grid|Open Grid (old)", "DataGrid", "", { menutoolbar: false, data: data_set })

dataGrid.add_control("data1", "Text data")
dataGrid.add_control("num1", "Num data")
dataGrid.add_control("grp", "Group data 1")
dataGrid.add_control("tom", "Group data 2")

q2forms.push(dataGrid);


const dataGrid2 = new Q2Form("Grid|Open Grid (new)", "DataGrid2", "", { menutoolbar: false })
// dataGrid2.add_control("/v", "")
// dataGrid2.add_control("txt", "", { control: "text", data: "12" })
dataGrid2.add_control("datagrid", "", { control: "form", data: dataGrid })
q2forms.push(dataGrid2);
