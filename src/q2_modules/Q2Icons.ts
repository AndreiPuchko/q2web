import React, { lazy, LazyExoticComponent } from "react";
import * as LucideIcons from "lucide-react";

type LucideIconType = React.ComponentType<any>;

type LazyIcon = LazyExoticComponent<LucideIconType>;

const iconNameMap: Record<string, string> = {
    new: "File",
    copy: "Files",
    remove: "FileX",
    edit: "FilePen",
    save: "Save",
};

const iconCache: Record<string, LazyIcon> = {};

const FallbackIcon = LucideIcons.Circle;

export function resolveIcon(name?: string): LazyIcon {
    const resolvedName = name ? iconNameMap[name] || name : null;

    if (!resolvedName) {
        return lazy(() =>
            Promise.resolve({ default: FallbackIcon })
        );
    }

    if (iconCache[resolvedName]) {
        return iconCache[resolvedName];
    }

    if ((LucideIcons as any)[resolvedName]) {
        const Icon = (LucideIcons as any)[resolvedName];
        iconCache[resolvedName] = lazy(() =>
            Promise.resolve({ default: Icon })
        );
        return iconCache[resolvedName];
    }

    iconCache[resolvedName] = lazy(() =>
        import("lucide-react")
            .then((mod) => {
                const Icon = (mod as any)[resolvedName];
                return { default: Icon || FallbackIcon };
            })
            .catch(() => ({ default: FallbackIcon }))
    );

    return iconCache[resolvedName];
}