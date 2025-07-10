import Form from '../components/Form';


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
    key: string;
    valid: any;
    data?: any;
    pic?: string;
    pi?: string;
    check?: boolean | string | number;
    checkChecked?: boolean | string | number;
    checkDisabled?: boolean | string | number;
    tag?: string;
    range?: string;

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
            key?: string,
            valid?: any,
            data?: any,
            pic?: string,
            pi?: string,
            check?: boolean | string | number,
            checkChecked?: boolean | string | number,
            checkDisabled?: boolean | string | number,
            tag?: string;
            range?: string;

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
        this.key = key;
        this.valid = options.valid ?? (() => true);
        this.data = options.data;
        this.pic = options.pic;
        this.pi = options.pi;
        this.check = options.check;
        this.checkChecked = options.checkChecked;
        this.checkDisabled = options.checkDisabled;
        this.tag = options.tag;
        this.range = options.range;

        if (this.control === "check") {
            this.stretch = 0
            this.size = "max"
        }
    }

    getStyle() {
        // console.log(this.control, this.label, this.stretch)
        if (this.datalen)
            return { flex: `0 1 auto` }
        else
            return { flex: `${this.stretch} 1 auto` }
    }
}

export class Q2Form {
    key: string;
    columns: any[];
    data: any[];
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
    width: number;
    height: number;
    x: number;
    y: number;
    s: Record<string, any> = {};
    w: Record<string, any> = {};
    c: Record<string, any> = {};
    hookInputChanged?: (form: Form) => void;
    hookFocusChanged?: (form: Form) => void;

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
        this.data = [];
        this.actions = [];
        this.title = title;
        this.icon = "form";
        this.width = 800;
        this.height = 600;
        this.x = 0;
        this.y = 0;
        if (key === "") {
            this.key = this.get_random_key();
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

    get_random_key() {
        let uid = "";
        for (var x = 0; x < 10; x++) {
            uid = uid + String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65));
        }
        return uid
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
}