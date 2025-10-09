import { Q2Form } from './Q2Form';
import { Q2App } from './Q2App';

export function showDialog(q2form: Q2Form) {
    Q2App.instance?.showDialog(q2form);
}

export function closeDialog(zIndex: number) {
    Q2App.instance?.closeDialog(zIndex);
}

export function GetQ2AppInstance() {
    const Q2AppInstance = Q2App.instance;
    return Q2AppInstance;
}