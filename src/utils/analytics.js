const GTM_CONTAINER_ID = (process.env.REACT_APP_GTM_CONTAINER_ID || '').trim();
const CONSENT_STORAGE_KEY = 'bb_consent_v1';
const CONSENT_GRANTED = 'granted';
const CONSENT_DENIED = 'denied';

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function hasGtmContainer() {
  return /^GTM-[A-Z0-9]+$/i.test(GTM_CONTAINER_ID);
}

function ensureDataLayer() {
  if (!canUseDom()) return null;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  return window.dataLayer;
}

function sanitizeEventParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) acc[key] = trimmed;
      return acc;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function parseStoredConsent(rawValue) {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed?.analytics === 'boolean') return parsed;
    return null;
  } catch {
    return null;
  }
}

function pushConsentUpdate(analyticsAllowed) {
  if (!canUseDom()) return;
  ensureDataLayer();
  const consentState = analyticsAllowed ? CONSENT_GRANTED : CONSENT_DENIED;
  window.gtag('consent', 'update', {
    analytics_storage: consentState,
    ad_storage: CONSENT_DENIED,
    ad_user_data: CONSENT_DENIED,
    ad_personalization: CONSENT_DENIED
  });
  window.dataLayer.push({
    event: 'consent_update',
    analytics_consent: analyticsAllowed ? 'granted' : 'denied'
  });
}
export function initAnalytics() {
  if (!canUseDom()) return;
  ensureDataLayer();
  if (!hasGtmContainer()) return;
  const consent = getStoredConsent();
  if (!consent) {
    window.gtag('consent', 'default', {
      analytics_storage: CONSENT_DENIED,
      ad_storage: CONSENT_DENIED,
      ad_user_data: CONSENT_DENIED,
      ad_personalization: CONSENT_DENIED
    });
    return;
  }
  pushConsentUpdate(!!consent.analytics);
}

export function getStoredConsent() {
  if (!canUseDom()) return null;
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return parseStoredConsent(raw);
}

export function setAnalyticsConsent(analyticsAllowed) {
  if (!canUseDom()) return;
  const value = { analytics: !!analyticsAllowed };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  pushConsentUpdate(!!analyticsAllowed);
}

export function hasAnalyticsConsent() {
  const consent = getStoredConsent();
  return !!consent?.analytics;
}

export function trackEvent(eventName, params = {}) {
  if (!canUseDom() || !hasGtmContainer() || !hasAnalyticsConsent()) return;
  ensureDataLayer();
  const safeParams = sanitizeEventParams(params);
  window.dataLayer.push({
    event: eventName,
    ...safeParams
  });
}

export function trackPageView({ path, title, listingContext } = {}) {
  if (!canUseDom() || !hasGtmContainer() || !hasAnalyticsConsent()) return;
  ensureDataLayer();
  const safePath = path || `${window.location.pathname}${window.location.search || ''}`;
  const payload = sanitizeEventParams({
    page_path: safePath,
    page_location: window.location.href,
    page_title: title || document.title,
    listing_context: listingContext || ''
  });
  window.dataLayer.push({
    event: 'page_view',
    ...payload
  });
}
