// Only /api/auth/session can establish an ordinary BalhinBalay account. Browser
// demo data is never an identity or entitlement. Administration is deliberately
// outside this consumer-app policy and lives only on the standalone /admin page.
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
