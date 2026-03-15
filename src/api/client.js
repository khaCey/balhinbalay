/**
 * API client for BalhinBalay backend.
 * Base URL: REACT_APP_API_URL or same origin (empty string).
 * Token is set by AuthContext after login; sent as Authorization: Bearer <token>.
 */
export const baseUrl = process.env.REACT_APP_API_URL || '';

let authToken = null;
let on401Callback = null;

export const setToken = (token) => {
  authToken = token;
};

export const getToken = () => authToken;

export const clearToken = () => {
  authToken = null;
};

/** Set a callback to run on 401 (e.g. clear user / auto-logout). Call with null to clear. */
export const setOn401 = (fn) => {
  on401Callback = fn;
};

async function request(method, path, body = null) {
  const url = path.startsWith('http') ? path : baseUrl + path;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (authToken) {
    opts.headers.Authorization = 'Bearer ' + authToken;
  }
  if (body != null && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(url, opts);
  } catch (networkErr) {
    const err = new Error(networkErr.message || 'Network error');
    err.userMessage = 'Something went wrong. Try again.';
    throw err;
  }
  const text = await res.text();
  let data = null;
  try {
    if (text) data = JSON.parse(text);
  } catch {
    // leave data null; use raw text for error display if needed
    if (text && !res.ok) data = { message: text.length > 200 ? text.slice(0, 200) + '…' : text };
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    if (res.status === 401) {
      clearToken();
      if (typeof on401Callback === 'function') on401Callback();
      err.userMessage = 'Session expired. Please log in again.';
    } else if (res.status === 403) {
      const msg = (data && data.error) || '';
      if (msg === 'Account suspended' || msg === 'Account banned') {
        clearToken();
        if (typeof on401Callback === 'function') on401Callback();
        err.userMessage = msg;
      } else {
        err.userMessage = (data && (data.error || data.message)) || "You don't have permission.";
      }
    } else if (res.status === 404) {
      err.userMessage = (data && (data.error || data.message)) || 'Not found.';
    } else if (res.status === 413) {
      err.userMessage = 'Images are too large. Try fewer or smaller images, then submit again.';
    } else {
      const serverMsg = data && (data.error || data.message);
      err.userMessage = serverMsg || (res.status ? `Request failed (${res.status}). Check that the server is running.` : 'Something went wrong. Try again.');
    }
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  postFormData: (path, formData) => requestFormData('POST', path, formData),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path, body) => request('DELETE', path, body ?? null)
};

async function requestFormData(method, path, formData) {
  const url = path.startsWith('http') ? path : baseUrl + path;
  const opts = {
    method,
    headers: {}
  };
  if (authToken) {
    opts.headers.Authorization = 'Bearer ' + authToken;
  }
  opts.body = formData;
  let res;
  try {
    res = await fetch(url, opts);
  } catch (networkErr) {
    const err = new Error(networkErr.message || 'Network error');
    err.userMessage = 'Something went wrong. Try again.';
    throw err;
  }
  const text = await res.text();
  let data = null;
  try {
    if (text) data = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    if (res.status === 401) {
      clearToken();
      if (typeof on401Callback === 'function') on401Callback();
      err.userMessage = 'Session expired. Please log in again.';
    } else if (res.status === 413) {
      err.userMessage = 'Images are too large. Try fewer or smaller images, then submit again.';
    } else {
      const serverMsg = data && (data.error || data.message);
      err.userMessage = serverMsg || (res.status ? `Request failed (${res.status}). Check that the server is running.` : 'Something went wrong. Try again.');
    }
    throw err;
  }
  return data;
}
