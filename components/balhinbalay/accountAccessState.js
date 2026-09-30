export const terminalResetCodes = new Set(['ALREADY_USED','EXPIRED_TOKEN','INVALID_TOKEN']);

export const isTerminalResetError = code => terminalResetCodes.has(code);

export const resetViewMode = (mode, actionToken) =>
  mode === 'reset-password' && !actionToken ? 'reset-invalid' : mode;

export const shouldRedirectSignedInAuth = (mode, currentPage = mode) =>
  ['login','register','forgot-password'].includes(mode) && currentPage === mode;
