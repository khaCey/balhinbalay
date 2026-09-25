export const SUPPORT_EMAIL = 'support@balhinbalay.com';

export function reportMailto(property, reason, details = '') {
  const subject = `BalhinBalay beta report: sample listing ${property.id}`;
  const body = [
    'I would like to report something shown in the BalhinBalay beta.',
    '',
    `Sample listing: ${property.title} (ID ${property.id})`,
    `Issue: ${reason}`,
    ...(details.trim() ? [`Details: ${details.trim()}`] : []),
    '',
    'This listing is illustrative. Sending this email does not create a moderation ticket.',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
