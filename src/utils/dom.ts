export function focusFirstFocusableElement(container: HTMLElement | null): void {
  if (!container) return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  for (let i = 0; i < focusableElements.length; i++) {
    const element = focusableElements[i] as HTMLElement;
    if (element && !element.disabled && element.style.display !== 'none' && element.style.visibility !== 'hidden') {
      element.focus();
      return;
    }
  }
}
