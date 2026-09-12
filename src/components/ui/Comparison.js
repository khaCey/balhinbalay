import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useListings } from '../../context/ListingsContext';
import BottomSheet from './BottomSheet';
import { Icon } from './Controls';
import { moveInFees } from './PropertyCosts';

const Context = createContext(null);
export function CompareButton({ property }) {
  const comparison = useContext(Context);
  if (!comparison) return null;
  const selected = comparison.ids.includes(property.id);
  return (
    <button
      type="button"
      className="bb-compare-button"
      aria-pressed={selected}
      onClick={() => comparison.toggle(property.id)}
    >
      <Icon name={selected ? 'check' : 'plus'} />
      Compare
    </button>
  );
}
export default function ComparisonProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setIds([]);
    setOpen(false);
    setNotice('');
  }, [user?.id]);
  const showTray = ['/', '/rent', '/sale', '/saved'].includes(pathname);
  const { listings, searchResults } = useListings();
  const toggle = (id) => {
    if (!ids.includes(id) && ids.length === 3) {
      setNotice(
        'You can compare up to three places. Remove one to add another.',
      );
      return;
    }
    setNotice('');
    setIds((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  };
  const selected = ids
    .map((id) => [...listings, ...searchResults].find((item) => item.id === id))
    .filter(Boolean);
  const rows = [
    [
      'Price',
      (item) =>
        `₱${Number(item.price).toLocaleString()}${item.listingType === 'rent' ? ' / month' : ''}`,
    ],
    [
      'Location',
      (item) => [item.location, item.city].filter(Boolean).join(', '),
    ],
    ['Property type', (item) => item.type],
    ['Bedrooms', (item) => item.beds ?? 'Not specified'],
    ['Bathrooms', (item) => item.baths ?? 'Not specified'],
    [
      'Floor area',
      (item) =>
        item.size || (item.sizeSqm ? `${item.sizeSqm} m²` : 'Not specified'),
    ],
    ['Furnishing', (item) => item.furnished || 'Not specified'],
    [
      'Listed move-in fees',
      (item) =>
        item.listingType === 'rent'
          ? `₱${moveInFees(item).toLocaleString()}`
          : 'Not applicable',
    ],
  ];
  return (
    <Context.Provider value={{ ids, toggle }}>
      {children}
      {ids.length > 0 && !open && showTray && (
        <div className="bb-compare-tray">
          <span>{notice || `${ids.length} / 3 places selected`}</span>
          <button
            className="bb-icon-button"
            type="button"
            aria-label="Clear comparison"
            onClick={() => {
              setIds([]);
              setNotice('');
            }}
          >
            <Icon name="close" />
          </button>
          <button
            type="button"
            className="bb-button"
            onClick={() => setOpen(true)}
          >
            Compare
          </button>
        </div>
      )}
      <BottomSheet
        open={open}
        title="A closer comparison."
        onClose={() => setOpen(false)}
      >
        <div className="bb-comparison-table">
          <table>
            <thead>
              <tr>
                <th>At a glance</th>
                {selected.map((item) => (
                  <th key={item.id}>
                    {item.images?.[0] && <img src={item.images[0]} alt="" />}
                    <strong>{item.title}</strong>
                    <button
                      type="button"
                      className="bb-text-button"
                      onClick={() => toggle(item.id)}
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {selected.map((item) => (
                    <td key={item.id}>{value(item)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Take a look</th>
                {selected.map((item) => (
                  <td key={item.id}>
                    <button
                      type="button"
                      className="bb-button"
                      onClick={() => {
                        setOpen(false);
                        navigate(`/property/${item.id}`);
                      }}
                    >
                      View property
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {!selected.length && <p>Choose a couple of places to compare.</p>}
      </BottomSheet>
    </Context.Provider>
  );
}
