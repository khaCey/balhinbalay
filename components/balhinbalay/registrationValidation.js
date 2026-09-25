export function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function validateRegistration({email, password, confirmation}) {
  const address = normaliseEmail(email);
  if (!address || address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    return 'Enter a valid email address.';
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) return 'Use 12 to 128 characters for your password.';
  if (password !== confirmation) return 'The passwords do not match.';
  return null;
}
