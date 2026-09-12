import React, { useMemo, useState } from 'react';
import { cebuCities, getCityById, philippineRegions } from '../../data/cities';
import BottomSheet from './BottomSheet';
import { Icon, SegmentedControl } from './Controls';

export default function CitySelector({
  selectedIds,
  counts,
  onApply,
  onClose,
}) {
  const [draft, setDraft] = useState(selectedIds);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('suggested');
  const [region, setRegion] = useState('all');
  const [province, setProvince] = useState('');
  const available = useMemo(
    () =>
      cebuCities.filter(
        (city) => counts.has(city.id) || selectedIds.includes(city.id),
      ),
    [counts, selectedIds],
  );
  const regions = philippineRegions.filter(
    (item) =>
      item.id !== 'all' && available.some((city) => city.regionId === item.id),
  );
  const provinces = [
    ...new Set(
      available
        .filter((city) => region === 'all' || city.regionId === region)
        .map((city) => city.province),
    ),
  ].filter(Boolean);
  const cities = available
    .filter(
      (city) =>
        `${city.displayName} ${city.province}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (tab === 'suggested' ||
          ((region === 'all' || city.regionId === region) &&
            (!province || city.province === province))),
    )
    .sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0));
  const toggle = (id) =>
    setDraft((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  return (
    <BottomSheet
      open
      title="Where feels like home?"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="bb-button bb-full"
          onClick={() => onApply(draft)}
        >
          Choose {draft.length || 'your'}{' '}
          {draft.length === 1 ? 'city' : 'cities'} <Icon name="arrow" />
        </button>
      }
    >
      <label className="bb-field">
        Search cities
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try Cebu, Mandaue or Danao"
          autoFocus
        />
      </label>
      <SegmentedControl
        label="Find cities"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'suggested', label: 'Suggested' },
          { value: 'browse', label: 'Browse regions' },
        ]}
      />
      {tab === 'browse' && (
        <div className="bb-field-row">
          <label className="bb-field">
            Region
            <select
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                setProvince('');
              }}
            >
              <option value="all">All regions</option>
              {regions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="bb-field">
            Province
            <select
              value={province}
              onChange={(event) => setProvince(event.target.value)}
            >
              <option value="">All provinces</option>
              {provinces.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {draft.length > 0 && (
        <div className="bb-chips">
          {draft.map((id) => (
            <button
              className="bb-chip active"
              key={id}
              onClick={() => toggle(id)}
              type="button"
              aria-label={`Remove ${getCityById(id)?.displayName}`}
            >
              {getCityById(id)?.displayName}
              <Icon name="close" />
            </button>
          ))}
        </div>
      )}
      <p className="bb-picker-label">
        {tab === 'suggested' ? 'Popular cities' : 'Browse cities'}{' '}
        <span>{draft.length} selected</span>
      </p>
      <div className="bb-city-options">
        {cities.map((city) => (
          <button
            type="button"
            key={city.id}
            className={draft.includes(city.id) ? 'selected' : ''}
            aria-pressed={draft.includes(city.id)}
            onClick={() => toggle(city.id)}
          >
            <span className="bb-check">
              {draft.includes(city.id) && <Icon name="check" />}
            </span>
            <span>
              <strong>{city.displayName}</strong>
              <small>
                {city.province} · {counts.get(city.id) || 0} listings
              </small>
            </span>
          </button>
        ))}
      </div>
      {!cities.length && (
        <p className="bb-muted">
          No cities with matching listings yet. Try another name or listing
          type.
        </p>
      )}
    </BottomSheet>
  );
}
