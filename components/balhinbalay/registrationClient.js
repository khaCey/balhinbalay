// Account service traffic stays on the Site origin. The server-only route proxies to
// the account service; browser code contains no backend credentials or session token.
async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      method: options.method || (options.body ? 'POST' : 'GET'),
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      cache: 'no-store',
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('The account service could not be reached. Please try again later.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? 'The account service is not available yet.'
        : data.message || 'The account request could not be completed.'
    );
    error.code = data.code || null;
    throw error;
  }
  return data;
}

export const registrationClient = {
  register: (email, password) => request('/api/auth/register', {body: {email, password}}),
  resend: email => request('/api/auth/resend-verification', {body: {email}}),
  verify: token => request('/api/auth/verify-email', {body: {token}}),
  login: (email, password) => request('/api/auth/login', {body: {email, password}}),
  session: () => request('/api/auth/session'),
  logout: () => request('/api/auth/logout', {body: {}}),
  forgot: email => request('/api/auth/forgot-password', {body: {email}}),
  reset: (token,password) => request('/api/auth/reset-password', {body: {token,password}}),
  adminAccounts: () => request('/api/admin/accounts'),
  createAdminAccount: (email,password) => request('/api/admin/accounts', {body: {email,password}}),
  deleteAdminAccount: id => request(`/api/admin/accounts/${encodeURIComponent(id)}`, {method: 'DELETE'}),
};
