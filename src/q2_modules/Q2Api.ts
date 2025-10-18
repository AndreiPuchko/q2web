import { Q2Form } from './Q2Form';
import { Q2App } from './Q2App';

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
