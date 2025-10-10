import React from 'react';
import ReactDOM from 'react-dom';
import Q2App from './q2_modules/Q2App';
import { Q2Form } from './q2_modules/Q2Form';

// Example props
const q2forms: Q2Form[] = [
    // ...populate with Q2Form instances...
    

ReactDOM.render(
    <React.StrictMode>
        <Q2App q2forms={q2forms} />
    </React.StrictMode>,
    document.getElementById('root')
);
