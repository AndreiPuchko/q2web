## How to -

### main.tsx
```typescript`
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { q2forms } from './q2app/q2app';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App q2forms={q2forms} />);
```



### add React component
```typescript
import { StudentClasses } from "./StudentClasses"

const student_home = new Q2Form("", "", "student_home");
student_home.add_control("sc", "", {
    control: "widget",
    data: { widget: StudentClasses, props: { studentKey: "1" } }
})
```