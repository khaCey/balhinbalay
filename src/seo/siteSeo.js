export const SITE_NAME = 'BalhinBalay';
export const SITE_DESCRIPTION =
  'Find homes, condos, apartments, and land listings across the Philippines with BalhinBalay.';
export const DEFAULT_OG_IMAGE_PATH = '/logo.png';

export function getSiteOrigin() {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SITE_URL) {
    return process.env.REACT_APP_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return '';
}

export function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = getSiteOrigin();
  const path = String(pathOrUrl).startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return origin ? `${origin}${path}` : path;
}
