// Only /api/auth/session can establish an account. Browser demo data is never
// an identity or an entitlement, and the current service exposes no Lister grant.
export const ACCOUNT_PAGES = new Set(['saved', 'messages', 'chat', 'settings', 'editProfile']);
export const LISTER_PAGES = new Set(['owner', 'editor']);
export const ACCOUNT_MODALS = new Set(['save-search', 'enquiry', 'viewing']);
export const LISTER_MODALS = new Set(['availability', 'unlist']);

export function accessFor(page, account, sessionChecked) {
  if (LISTER_PAGES.has(page)) return !sessionChecked ? 'checking' : account ? 'lister-unavailable' : 'sign-in';
  if (ACCOUNT_PAGES.has(page)) return !sessionChecked ? 'checking' : account ? 'account-unavailable' : 'sign-in';
  return 'public';
}

export function modalAccess(type, account, sessionChecked) {
  if (LISTER_MODALS.has(type)) return accessFor('owner', account, sessionChecked);
  if (ACCOUNT_MODALS.has(type)) return accessFor('saved', account, sessionChecked);
  return 'public';
}
