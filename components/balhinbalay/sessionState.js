// Only a server-confirmed unauthenticated response ends a previously known
// session. A temporary account-service failure clears the displayed account
// but does not erase the evidence needed for the next normal recheck.
export function sessionOutcome(wasAuthenticated, user, {unauthenticated = false, suppressNotice = false} = {}) {
  return {
    account: user || null,
    hadAuthenticatedSession: user ? true : unauthenticated ? false : wasAuthenticated,
    showSessionEnded: Boolean(wasAuthenticated && unauthenticated && !suppressNotice),
  };
}
