import { Q2Form } from '../q2_modules/Q2Form';
import { Q2App } from './Q2App';

export function showDialog(q2form: Q2Form) {
    Q2App.instance?.showDialog(q2form);
}

export function closeDialog(zIndex: number) {
    Q2App.instance?.closeDialog(zIndex);
}
