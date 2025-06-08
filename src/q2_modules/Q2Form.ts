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
    }

    get_random_key() {
        let uid = "";
        for (var x = 0; x < 10; x++){
            uid = uid + String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65));
        }
        return uid
    }

    add_control(column: string, label?: string, options: { datalen?: number, stretch?: number, control?: string, valid?: any, data?: any, pic?: string, pi?: string } = {}) {
        const { datalen, stretch, control = 'line', valid = () => true, data = null, pic = '', pi = '' } = options;
        const controlObj = {
            column,
            label,
            datalen,
            stretch,
            control,
            key: this.columns.length > 0 ? this.columns.length.toString() : "0", // Unique key
            valid,
            data,
            pic,
            pi
        };
        this.columns.push(controlObj);
        return true;
    }
}