import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value); }
function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Missing patch target: ${label}`);
  return source.replace(from, to);
}

{
  const path = 'src/App.js';
  let s = read(path);

  s = replaceRequired(
    s,
    `  const filteredListingsForMyProperties = useMemo(() => {\n    if (!showMyPropertiesOnly) return [];\n    const filtered = listingsToFilter.filter((item) => item.listingType === myPropertiesListingType);\n    return [...filtered].sort((a, b) => {\n      switch (sortBy) {\n        case 'price-low': return a.price - b.price;\n        case 'price-high': return b.price - a.price;\n        case 'size-large': return (b.sizeSqm || 0) - (a.sizeSqm || 0);\n        case 'size-small': return (a.sizeSqm || 0) - (b.sizeSqm || 0);\n        case 'recommended':\n        case 'newest':\n        default: return new Date(b.datePosted || 0) - new Date(a.datePosted || 0);\n      }\n    });\n  }, [showMyPropertiesOnly, listingsToFilter, myPropertiesListingType, sortBy]);`,
    `  const filteredListingsForMyProperties = useMemo(() => {\n    if (!showMyPropertiesOnly) return [];\n    return [...listingsToFilter].sort((a, b) => {\n      switch (sortBy) {\n        case 'price-low': return a.price - b.price;\n        case 'price-high': return b.price - a.price;\n        case 'size-large': return (b.sizeSqm || 0) - (a.sizeSqm || 0);\n        case 'size-small': return (a.sizeSqm || 0) - (b.sizeSqm || 0);\n        case 'recommended':\n        case 'newest':\n        default: return new Date(b.datePosted || 0) - new Date(a.datePosted || 0);\n      }\n    });\n  }, [showMyPropertiesOnly, listingsToFilter, sortBy]);`,
    'show all owner listings',
  );

  s = replaceRequired(
    s,
    `            {showMyPropertiesOnly && user && (\n              <div className="my-properties-bar">\n                <p className="bb-owner-intro">A clear view of every listing.</p>\n                <div className="my-properties-bar-toggle-wrap">\n                  <ListingTypeToggle\n                    value={myPropertiesListingType}\n                    onChange={setMyPropertiesListingType}\n                  />\n                </div>\n              </div>\n            )}`,
    `            {showMyPropertiesOnly && user && (\n              <p className="bb-owner-intro bb-owner-intro--standalone">A clear view of every listing.</p>\n            )}`,
    'remove owner rent sale toggle',
  );

  s = replaceRequired(
    s,
    `            ) : (\n              <SortBar\n                sortBy={sortBy}\n                onSortChange={setSortBy}\n                totalResults={listingsForView.length}\n                isMyProperties={showMyPropertiesOnly && !!user}\n              />\n            )}`,
    `            ) : showMyPropertiesOnly ? null : (\n              <SortBar\n                sortBy={sortBy}\n                onSortChange={setSortBy}\n                totalResults={listingsForView.length}\n                isMyProperties={false}\n              />\n            )}`,
    'remove owner sort summary bar',
  );

  s = replaceRequired(
    s,
    `                    <h4>No {myPropertiesListingType === 'rent' ? 'rental' : 'sale'} listings</h4>\n                    <p className="text-muted">You have no properties listed for {myPropertiesListingType === 'rent' ? 'rent' : 'sale'} yet. Add one to get started.</p>`,
    `                    <h4>No properties yet</h4>\n                    <p className="text-muted">You have no listings yet. Add one to get started.</p>`,
    'owner empty state',
  );

  write(path, s);
}

{
  const path = 'src/styles/chat-owner-parity.css';
  let s = read(path);
  const addition = `\n\n/* The approved owner overview is one mixed status list, not a separate rent/sale dashboard. */\n.bb-owner-intro--standalone {\n  margin: 0 0 16px;\n}\n\n@media (min-width: 760px) {\n  .bb-owner-intro--standalone {\n    margin-bottom: 18px;\n  }\n}\n`;
  if (!s.includes('approved owner overview is one mixed status list')) s += addition;
  write(path, s);
}
