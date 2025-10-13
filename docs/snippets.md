## How to -

### add React component
```typescript
import { StudentClasses } from "./StudentClasses"

const student_home = new Q2Form("", "", "student_home");
student_home.add_control("sc", "", {
    control: "widget",
    data: { widget: StudentClasses, props: { studentKey: "1" } }
})
```