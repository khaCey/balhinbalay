import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value); }
function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Missing patch target: ${label}`);
  return source.replace(from, to);
}

// Property detail: stop rendering the stored exact coordinate in the public UI.
{
  const path = 'src/components/PropertyDetailContent.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `import PropertyMapPreview from './PropertyMapPreview';\n`,
    ``,
    'remove exact map import',
  );
  s = replaceRequired(
    s,
    `          {property.coordinates && (\n            <section className="bb-detail-section">\n              <h2>Get to know the neighbourhood</h2>\n              <p>{location}</p>\n              <div className="bb-property-map">\n                <PropertyMapPreview\n                  coordinates={property.coordinates}\n                  title={property.title}\n                />\n              </div>\n            </section>\n          )}`,
    `          {(property.location || city) && (\n            <section className="bb-detail-section">\n              <h2>Get to know the neighbourhood</h2>\n              <div className="bb-neighbourhood-card">\n                <span className="bb-neighbourhood-icon"><Icon name="pin" /></span>\n                <div>\n                  <strong>{location || city}</strong>\n                  <p>Approximate location · Exact address stays private unless the owner explicitly chooses to reveal it.</p>\n                </div>\n              </div>\n            </section>\n          )}`,
    'privacy-safe neighbourhood presentation',
  );
  write(path, s);
}

// Chat: show the same useful property context as the approved card without changing message behaviour.
{
  const path = 'src/pages/ChatPage.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `  const participantInitials = participantName\n    .split(/\\s+/)\n    .filter(Boolean)\n    .map((part) => part.charAt(0))\n    .slice(0, 2)\n    .join('')\n    .toUpperCase();`,
    `  const participantInitials = participantName\n    .split(/\\s+/)\n    .filter(Boolean)\n    .map((part) => part.charAt(0))\n    .slice(0, 2)\n    .join('')\n    .toUpperCase();\n  const propertyLocation = [property.location, property.city].filter(Boolean).join(', ');`,
    'chat property location',
  );
  s = replaceRequired(
    s,
    `        <span>\n          <strong>{property.title}</strong>\n          <small>View property</small>\n        </span>\n      </button>`,
    `        <span className="bb-chat-property-copy">\n          <span className="bb-chat-property-price">\n            ₱{Number(property.price || 0).toLocaleString()}\n            {property.listingType === 'rent' && <small> / mo</small>}\n          </span>\n          <strong>{property.title}</strong>\n          {propertyLocation && <small>{propertyLocation}</small>}\n        </span>\n        <Icon name="arrow" />\n      </button>`,
    'chat property context card',
  );
  write(path, s);
}

// Inbox: use the prototype-style unread count on the conversation row instead of a decorative dot.
{
  const path = 'src/pages/MessagesPage.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `                    {thread.unreadCount > 0 && (\n                      <span\n                        className="messages-panel-row-unread"\n                        aria-label="Unread"\n                      />\n                    )}`,
    `                    {thread.unreadCount > 0 && (\n                      <span\n                        className="messages-panel-row-unread"\n                        aria-label={\`${'${thread.unreadCount}'} unread\`}\n                      >\n                        {thread.unreadCount}\n                      </span>\n                    )}`,
    'message unread count',
  );
  write(path, s);
}

// Styling for the privacy-safe location card and richer property context.
{
  const path = 'src/styles/chat-owner-parity.css';
  let s = read(path);
  const addition = `\n\n/* Final chat property-context parity. */\n.bb-chat-property-copy {\n  min-width: 0;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n}\n\n.bb-chat-property-price {\n  color: var(--bb-ink);\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 1.2;\n}\n\n.bb-chat-property-price small {\n  display: inline;\n  margin: 0;\n  color: var(--bb-muted);\n  font-size: 11px;\n  font-weight: 500;\n}\n\n.bb-chat-property > svg {\n  width: 18px;\n  height: 18px;\n  flex: 0 0 auto;\n  color: var(--bb-ink);\n}\n\n.bb-neighbourhood-card {\n  margin-top: 12px;\n  padding: 16px;\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  border: 1px solid var(--bb-line);\n  border-radius: 16px;\n  background: #fff;\n}\n\n.bb-neighbourhood-icon {\n  width: 30px;\n  height: 30px;\n  flex: 0 0 30px;\n  display: grid;\n  place-items: center;\n  color: var(--bb-blue-hover);\n}\n\n.bb-neighbourhood-icon svg {\n  width: 18px;\n  height: 18px;\n}\n\n.bb-neighbourhood-card strong {\n  display: block;\n  margin-bottom: 3px;\n  color: var(--bb-ink);\n  font-size: 14px;\n}\n\n.bb-neighbourhood-card p {\n  margin: 0;\n  color: var(--bb-muted);\n  font-size: 12px;\n  line-height: 1.45;\n}\n`;
  if (!s.includes('Final chat property-context parity.')) s += addition;
  write(path, s);
}

{
  const path = 'src/styles/saved-messages-parity.css';
  let s = read(path);
  s = replaceRequired(
    s,
    `.bb-messages-page .messages-panel-row-unread {\n  position: absolute;\n  right: 0;\n  bottom: 20px;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: var(--bb-blue);\n}`,
    `.bb-messages-page .messages-panel-row-unread {\n  flex: 0 0 auto;\n  min-width: 24px;\n  min-height: 42px;\n  padding: 0 7px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px;\n  background: var(--bb-soft);\n  color: var(--bb-blue-hover);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.bb-messages-page .bb-inbox-heading .bb-count {\n  display: none;\n}`,
    'message unread badge styles',
  );
  write(path, s);
}
