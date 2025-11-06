import Q2FrontForm from '../components/Q2FrontForm';
import { Q2DataList } from '../components/widgets/DataList';
import { showDialog, closeDialog } from './Q2Api';
import { generateRandomKey } from "../q2_modules/Q2Api"

export class Q2Control {
    column: string;
    label?: string;
    datalen?: number;
    datadec: number;
    datatype: string;
    size: string;
    stretch?: number;
    alignment?: number;
    control: string;
    readonly: boolean;
    disabled: boolean;
    key: string;
    valid: any;
    data?: any;
    pic: string;
    check?: boolean | string | number;
    checkChecked?: boolean | string | number;
    checkDisabled?: boolean | string | number;
    tag?: string;
    range?: string;
    style?: {};
    class?: string;

    constructor(
        column: string,
        label?: string,
        options: {
            datalen?: number,
            datadec?: number,
            datatype?: string,
            size?: string,
            stretch?: number,
            alignment?: number,
            control?: string,
            readonly?: boolean,
            disabled?: boolean;
            key?: string,
            valid?: any,
            data?: any,
            pic?: string,
            check?: boolean | string | number,
            checkChecked?: boolean | string | number,
            checkDisabled?: boolean | string | number,
            tag?: string;
            range?: string;
            style?: {};
            class?: string;

        } = {},
        key: string = "0"
    ) {
        this.column = column;
        this.label = label;
        this.datalen = options.datalen;
        this.datadec = options.datadec !== undefined ? options.datadec : 0;
        this.datatype = options.datatype !== undefined ? options.datatype : "";
        this.stretch = options.stretch !== undefined ? options.stretch : 1;
        this.size = options.size !== undefined ? options.size : "";
        this.alignment = options.alignment;
        this.control = options.control ?? 'line';
        this.readonly = options.readonly ?? false;
        this.disabled = options.disabled ?? false;
        this.key = key;
        this.valid = options.valid ?? (() => true);
        this.data = options.data;
        this.pic = options?.pic || "";
        this.check = options.check;
        this.checkChecked = options.checkChecked;
        this.checkDisabled = options.checkDisabled;
        this.tag = options.tag;
        this.range = options.range;
        this.style = options?.style || {};
        this.class = options?.class || "";

        if (this.control === "check") {
            this.stretch = 0
            this.size = "max"
        }
    }

    getStyle() {
        // console.log(this.control, this.label, this.stretch)
        if (this.datalen)
            return { flex: `0 1 auto`, maxWidth: `${this.datalen}rem` }
        else
            return { flex: `${this.stretch} ${this.stretch}`, width: "100%" }
    }
}


type DataGridParams = {
    showCurrentRow?: boolean,
    showHeaders?: boolean,
    resizeColumns?: boolean,
    reorderColumns?: boolean,
    loader?: () => any,
}

const defaultDataGridParams: DataGridParams = {
    showHeaders: true,
    showCurrentRow: true,
    resizeColumns: true,
    reorderColumns: true,
}

export class Q2Form {
    key: string;
    columns: any[];
    data: any[] | (() => void);
    actions: any[];
    hasCancelButton: boolean;
    hasOkButton: boolean;
    hasMaxButton: boolean;
    description: string;
    menubarpath: string;
    menutoolbar: boolean | number;
    subForm: boolean;
    title: string;
    icon: string;
    width: number | string;
    height: number | string;
    left: number | string;
    top: number | string;
    resizeable: boolean;
    moveable: boolean;
    frameless: boolean;
    x: number;
    y: number;
    s: Record<string, any> = {};
    w: Record<string, any> = {};
    c: Record<string, any> = {};
    hookInputChanged?: (form: Q2FrontForm) => void;
    hookFocusChanged?: (form: Q2FrontForm) => void;
    hookShow?: (form: Q2FrontForm) => void;
    hookSubmit?: (form: Q2FrontForm) => boolean;
    hookCancel?: (form: Q2FrontForm) => boolean;
    hookClosed?: (form: Q2FrontForm) => void;
    hookDataGridRowClicked?: (form: Q2DataList) => void;
    dialogIndex: string;
    frontForm: Q2FrontForm | undefined;
    class: string;
    dataGridParams: DataGridParams;
    cssText: string;

    constructor(menubarpath: string = "", title: string = "", key: string = "", options: Partial<Q2Form> = {}) {
        this.key = key;
        this.columns = [];
        this.hasCancelButton = false;
        this.hasOkButton = false;
        this.hasMaxButton = true;
        this.description = "";
        this.menubarpath = menubarpath;
        this.menutoolbar = options.menutoolbar ?? false;
        this.subForm = false;
        if (options.data) this.data = options.data; else this.data = [];
        this.actions = [];
        this.title = title;
        this.icon = "form";
        this.width = "";
        this.height = "";
        this.left = "";
        this.top = "";
        this.resizeable = true;
        this.moveable = true;
        this.frameless = false;
        this.x = 0;
        this.y = 0;
        this.dialogIndex = "";
        this.frontForm = undefined;
        this.class = options.class || "";
        this.dataGridParams = { ...options.dataGridParams, ...defaultDataGridParams }
        this.cssText = options.cssText ? options.cssText : "";
        if (key === "") {
            this.key = generateRandomKey();
        }
        else {
            this.key = `${this.key}_${generateRandomKey()}`
        }
        Object.assign(this, options);
        // Ensure all columns are Q2Control instances
        if (this.columns && Array.isArray(this.columns)) {
            this.columns = this.columns.map((col: any, idx: number) =>
                col instanceof Q2Control
                    ? col
                    : new Q2Control(
                        col.column,
                        col.label,
                        col,
                        col.key ?? idx.toString()
                    )
            );
        }
    }

    check_frameless() {
        if (this.frameless && this.width === "") this.width = "100%"
        if (this.frameless && this.height === "") this.height = "100%"
        if (this.frameless && this.top === "") this.top = "0"
        if (this.frameless && this.left === "") this.left = "0"
        if (this.height === "") this.height = "auto"
        if (this.width === "") this.width = "auto"
    }

    add_control(column: string, label?: string, options: any = {}) {
        // const key = this.columns.length > 0 ? this.columns.length.toString() : "0";
        const ctrl = new Q2Control(column, label, options);
        // Sync all option keys to the control instance
        for (const key in options) {
            if (options.hasOwnProperty(key)) {
                (ctrl as any)[key] = options[key];
            }
        }
        this.columns.push(ctrl);
        return ctrl;
    }

    showDialog() {
        showDialog(this);
    }

    closeDialog() {
        closeDialog(this.dialogIndex);
    }

    setCssText(cssText: string) {
        this.cssText = cssText;
        if (this.frontForm) {
            this.frontForm.setCssText(cssText)
        }
    }
}