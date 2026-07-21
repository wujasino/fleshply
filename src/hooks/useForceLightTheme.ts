import { useEffect } from 'react';

/**
 * The app defaults to dark mode, but the public landing page is light-only —
 * it needs to look right in social previews and for signed-out visitors
 * regardless of the dark-by-default app preference. Strips the `.dark` class
 * while mounted and restores it on unmount (e.g. navigating into the app).
 */
export function useForceLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');
    return () => {
      if (hadDark) root.classList.add('dark');
    };
  }, []);
}
