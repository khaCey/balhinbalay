export const DESKTOP_BREAKPOINT = 768;

export function getIsDesktop() {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;
}
