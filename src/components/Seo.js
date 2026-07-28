import { useEffect, useMemo } from 'react';
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, toAbsoluteUrl } from '../seo/siteSeo';

function upsertMeta({ name, property, content }) {
  if (!content) return;
  const attr = name ? 'name' : 'property';
  const value = name || property;
  if (!value) return;
  let tag = document.head.querySelector(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLink({ rel, href }) {
  if (!rel || !href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function cleanJsonLd(value) {
  if (Array.isArray(value)) {
    return value
      .map(cleanJsonLd)
      .filter((item) => item !== undefined && item !== null);
  }
  if (value && typeof value === 'object') {
    const cleaned = Object.entries(value).reduce((acc, [key, val]) => {
      const next = cleanJsonLd(val);
      if (next !== undefined && next !== null && next !== '') {
        acc[key] = next;
      }
      return acc;
    }, {});
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  if (value === undefined || value === null || value === '') return undefined;
  return value;
}

export default function Seo({
  title,
  description,
  canonicalPath,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = 'summary_large_image',
  noindex = false,
  type = 'website',
  jsonLd = null,
  jsonLdId = 'seo-json-ld'
}) {
  const canonicalUrl = useMemo(() => {
    const path =
      canonicalPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search || ''}`
        : '/');
    return toAbsoluteUrl(path);
  }, [canonicalPath]);

  useEffect(() => {
    const finalTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = finalTitle;

    const finalDescription = description || '';
    const finalOgTitle = ogTitle || finalTitle;
    const finalOgDescription = ogDescription || finalDescription;
    const finalImage = toAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE_PATH);

    if (finalDescription) {
      upsertMeta({ name: 'description', content: finalDescription });
    }
    upsertMeta({ name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow' });

    upsertMeta({ property: 'og:type', content: type });
    upsertMeta({ property: 'og:site_name', content: SITE_NAME });
    upsertMeta({ property: 'og:title', content: finalOgTitle });
    upsertMeta({ property: 'og:description', content: finalOgDescription });
    upsertMeta({ property: 'og:url', content: canonicalUrl });
    if (finalImage) upsertMeta({ property: 'og:image', content: finalImage });
    if (finalImage) upsertMeta({ property: 'og:image:alt', content: finalOgTitle });

    upsertMeta({ name: 'twitter:card', content: twitterCard });
    upsertMeta({ name: 'twitter:title', content: finalOgTitle });
    upsertMeta({ name: 'twitter:description', content: finalOgDescription });
    if (finalImage) upsertMeta({ name: 'twitter:image', content: finalImage });
    if (finalImage) upsertMeta({ name: 'twitter:image:alt', content: finalOgTitle });

    upsertLink({ rel: 'canonical', href: canonicalUrl });
  }, [
    canonicalUrl,
    description,
    noindex,
    ogDescription,
    ogImage,
    ogTitle,
    title,
    twitterCard,
    type
  ]);

  useEffect(() => {
    if (!jsonLd) return undefined;
    const id = jsonLdId || 'seo-json-ld';
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      document.head.appendChild(script);
    }
    const cleaned = cleanJsonLd(jsonLd);
    script.textContent = JSON.stringify(cleaned);
    return () => {
      const mounted = document.getElementById(id);
      if (mounted) mounted.remove();
    };
  }, [jsonLd, jsonLdId]);

  return null;
}
