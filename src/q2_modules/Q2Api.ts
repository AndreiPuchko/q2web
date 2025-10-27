import { Q2Form } from './Q2Form';
import { Q2App } from './Q2App';
import cloneDeep from "lodash/cloneDeep";

export function showDialog(q2form: Q2Form) {
    Q2App.instance?.showDialog(q2form);

}

export function closeDialog(zIndex: string) {
    Q2App.instance?.closeDialog(zIndex);
}

export function GetQ2AppInstance() {
    const Q2AppInstance = Q2App.instance;
    return Q2AppInstance;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
    const res = await fetch(`${Q2App.apiUrl}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!res.ok) throw new Error("Request failed");
    return res.json();
}
export function generateRandomKey() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}

export function cloneForm<T extends Q2Form>(q2form: T): T {
    if (!q2form) throw new Error("cloneForm: q2form is undefined");

    const cloned = cloneDeep(q2form);

    Object.setPrototypeOf(cloned, Object.getPrototypeOf(q2form));

    const hookNames = [
        "hookShow",
        "hookSubmit",
        "hookCancel",
        "hookInputChanged",
        "hookFocusChanged",
        "hookClosed",
    ];

    for (const hook of hookNames) {
        if (typeof (q2form as any)[hook] === "function") {
            (cloned as any)[hook] = (q2form as any)[hook];
        }
    }

    return cloned;
}