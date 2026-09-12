import React, { useState } from 'react';
import { useSavedSearches } from '../../context/SavedSearchesContext';
import { useAuth } from '../../context/AuthContext';
import BottomSheet from './BottomSheet';

export default function SaveSearchButton({ state }) {
  const { saveSearch } = useSavedSearches();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  // The existing API omits these fields. Do not silently save a different search.
  const unsupported =
    (state.selectedCityIds?.length || 0) > 1 ||
    state.view === 'school' ||
    (user &&
      (state.priceMin != null ||
        state.priceMax != null ||
        state.furnishedFilter));
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    const id = await saveSearch(name, state);
    setBusy(false);
    if (id) {
      setOpen(false);
      setMessage('Search saved.');
    } else setMessage('Unable to save. Please try again.');
  };
  return (
    <>
      <button
        type="button"
        className="bb-text-button"
        onClick={() => {
          setMessage('');
          setOpen(true);
        }}
      >
        Save search
      </button>
      {message && (
        <span className="bb-muted" role="status">
          {message}
        </span>
      )}
      <BottomSheet
        open={open}
        title="A good search is worth keeping."
        onClose={() => !busy && setOpen(false)}
      >
        {unsupported ? (
          <p>
            Saving this combination of filters is not available yet. Your
            current search is still open.
          </p>
        ) : (
          <form onSubmit={save}>
            <label className="bb-field">
              Name this search
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={200}
                autoFocus
                placeholder="My next place"
              />
            </label>
            <button className="bb-button bb-full" disabled={busy}>
              {busy ? 'Saving…' : 'Save search'}
            </button>
          </form>
        )}
      </BottomSheet>
    </>
  );
}
