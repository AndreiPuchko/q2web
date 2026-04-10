import React from "react";
import { Menu, File, Files, FileX, FilePen, Save, Circle } from "lucide-react";
import { createLucideIcon, IconNode } from "lucide-react";

const LucideIcons = {
    Menu: Menu,
    File: File,
    Files: Files,
    FileX: FileX,
    FilePen: FilePen,
    Save: Save,
    Circle: Circle
};

type LucideIconType = React.ComponentType<any>;

export type IconProps = React.SVGProps<SVGSVGElement> & {
    name?: string;
    size?: number;
    strokeWidth?: number;
};

// mapping
const iconNameMap: Record<string, string> = {
    new: "File",
    copy: "Files",
    remove: "FileX",
    edit: "FilePen",
    save: "Save",
    menu: "Menu",
};

// 🎯 fallback
const FallbackIcon: LucideIconType = LucideIcons.Circle;

// Custom icon
const exitNode: IconNode = [
    ["circle", { cx: "12.4", cy: "7", r: "0.5" }],
    ["path", { d: "M13 20v-3l-2-3 1.5-4.5 2 2 2 1" }],
    ["path", { d: "M5 17h3l2-3 1.5-4.5h-1l-2 1-1 2" }],
    ["path", { d: "M4 20v2" }],
    ["path", { d: "M4 14 4 4 A2 2 0 0 1 6 2 h12 a2 2 0 0 1 2 2 V22" }],
];

const ExitIcon = createLucideIcon("Exit", exitNode);

// custom icons registry
const customIcons: Record<string, LucideIconType> = {
    exit: ExitIcon,
};

export function Q2Icon({
    name,
    size = 24,
    strokeWidth = 1.5,
    ...props
}: IconProps) {
    let IconComponent: LucideIconType = FallbackIcon;

    if (name) {
        // 1. кастомные
        if (customIcons[name]) {
            IconComponent = customIcons[name];
        } else {
            // 2. маппинг
            const resolvedName = iconNameMap[name] || name;

            // 3. lucide
            IconComponent =
                (LucideIcons as any)[resolvedName] || FallbackIcon;
        }
    }

    return (
        <IconComponent
            size={size}
            strokeWidth={strokeWidth}
            {...props}
        />
    );
}