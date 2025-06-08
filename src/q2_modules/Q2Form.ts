export class Q2Control {
    column: string;
    label?: string;
    datalen?: number;
    stretch?: number;
    control: string;
    readonly: boolean;
    key: string;
    valid: any;
    data?: any;
    pic?: string;
    pi?: string;

    constructor(
        column: string,
        label?: string,
        options: {
            datalen?: number, stretch?: number, control?: string, valid?: any, data?: any, pic?: string, pi?: string,
            readonly?: boolean
        } = {},
        key: string = "0"
    ) {
        this.column = column;
        this.label = label;
        this.datalen = options.datalen;
        this.stretch = options.stretch;
        this.control = options.control ?? 'line';
        this.readonly = options.readonly ?? false;
        this.key = key;
        this.valid = options.valid ?? (() => true);
        this.data = options.data;
        this.pic = options.pic;
        this.pi = options.pi;
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
    title: string;
    icon: string;
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(menubarpath: string = "", title: string = "", key: string = "", options: Partial<Q2Form> = {}) {
        this.key = key;
        this.columns = [];
        this.hasCancelButton = false;
        this.hasOkButton = false;
        this.hasMaxButton = true;
        this.description = "";
        this.menubarpath = menubarpath;
        this.menutoolbar = options.menutoolbar ?? false;
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

    add_control(column: string, label?: string,
        options: {
            datalen?: number, stretch?: number, control?: string, valid?: any, data?: any, pic?: string, pi?: string,
            readonly?: boolean,
        } = {}) {
        const key = this.columns.length > 0 ? this.columns.length.toString() : "0";
        const controlObj = new Q2Control(column, label, options, key);
        this.columns.push(controlObj);
        // if (this.key === "about") console.log(this.columns);
        return true;
    }
}