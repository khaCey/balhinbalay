export const terminalResetCodes = new Set(['ALREADY_USED','EXPIRED_TOKEN','INVALID_TOKEN']);

export const isTerminalResetError = code => terminalResetCodes.has(code);

export const shouldRedirectSignedInAuth = mode => ['login','register','forgot-password'].includes(mode);
