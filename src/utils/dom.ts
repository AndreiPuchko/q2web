export const focusFirstFocusableElement = (container: HTMLElement | null): void => {
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    if (firstFocusable) {
        firstFocusable.focus();
    }
};
