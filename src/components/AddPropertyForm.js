import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserListings } from '../context/UserListingsContext';
import {
  getCityById,
  philippineRegions,
  getProvincesByRegion,
  getCitiesByRegionAndProvince,
  getRegionIdsWithCities
} from '../data/cities';
import { getBarangayCoordinates } from '../data/barangayCentroids';
import MapPicker from './MapPicker';
import ConfirmModal from './ConfirmModal';

const PROPERTY_TYPES = ['House', 'Apartment', 'Condo', 'Land', 'Boarding House', 'Room'];
const MAX_IMAGE_DIM = 1200;
const JPEG_QUALITY = 0.8;

function resizeImageToDataUrl(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_IMAGE_DIM || height > MAX_IMAGE_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIM) / width);
          width = MAX_IMAGE_DIM;
        } else {
          width = Math.round((width * MAX_IMAGE_DIM) / height);
          height = MAX_IMAGE_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function geocodeAddress(locationPart, cityName, cityCoords) {
  if (!locationPart || !locationPart.trim()) return null;
  const loc = locationPart.trim();
  const city = (cityName || '').trim() || 'Cebu City';
  try {
    const params = new URLSearchParams({
      street: loc,
      city,
      country: 'Philippines',
      format: 'json',
      limit: '1'
    });
    if (cityCoords && cityCoords.lat != null && cityCoords.lng != null) {
      const pad = 0.15;
      params.set('viewbox', [
        cityCoords.lng - pad,
        cityCoords.lat - pad,
        cityCoords.lng + pad,
        cityCoords.lat + pad
      ].join(','));
    }
    params.set('countrycodes', 'ph');
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'BalhinBalay/1.0' } }
    );
    const data = await res.json();
    const first = Array.isArray(data) && data[0];
    if (first && first.lat && first.lon) {
      return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
    }
    const fallbackParams = new URLSearchParams({
      q: `${loc}, ${city}, Philippines`,
      format: 'json',
      limit: '1',
      countrycodes: 'ph'
    });
    if (cityCoords && cityCoords.lat != null && cityCoords.lng != null) {
      const pad = 0.2;
      fallbackParams.set('viewbox', [
        cityCoords.lng - pad,
        cityCoords.lat - pad,
        cityCoords.lng + pad,
        cityCoords.lat + pad
      ].join(','));
    }
    const fallbackRes = await fetch(
      `https://nominatim.openstreetmap.org/search?${fallbackParams}`,
      { headers: { 'User-Agent': 'BalhinBalay/1.0' } }
    );
    const fallbackData = await fallbackRes.json();
    const fallbackFirst = Array.isArray(fallbackData) && fallbackData[0];
    if (fallbackFirst && fallbackFirst.lat && fallbackFirst.lon) {
      return { lat: parseFloat(fallbackFirst.lat), lng: parseFloat(fallbackFirst.lon) };
    }
  } catch (e) {
    console.warn('Geocoding failed:', e);
  }
  return null;
}

const REGIONS_OPTIONS = philippineRegions.filter((r) => r.id !== 'all');
const REGIONS_WITH_CITIES = getRegionIdsWithCities();
const DEFAULT_REGION = REGIONS_WITH_CITIES[0] || 'region-vii';

function AddPropertyForm({ initialListing, onSuccess }) {
  const { user } = useAuth();
  const { addListing, updateListing } = useUserListings();
  const isEdit = !!initialListing;
  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [propertyType, setPropertyType] = useState('House');
  const [price, setPrice] = useState('');
  const [regionId, setRegionId] = useState(DEFAULT_REGION);
  const [province, setProvince] = useState(() => {
    const p = getProvincesByRegion(DEFAULT_REGION);
    return p[0] || '';
  });
  const [cityId, setCityId] = useState('cebu-city');
  const [location, setLocation] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sizeSqm, setSizeSqm] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [keyMoney, setKeyMoney] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [extraFees, setExtraFees] = useState('');
  const [advancePay, setAdvancePay] = useState('');
  const [brokerFee, setBrokerFee] = useState('');
  const [associationFee, setAssociationFee] = useState('');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [reservationFee, setReservationFee] = useState('');
  const [furnished, setFurnished] = useState('');
  const [sold, setSold] = useState(false);
  const [currentlyRented, setCurrentlyRented] = useState(false);
  const [availableFrom, setAvailableFrom] = useState('');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const provinceOptions = useMemo(
    () => getProvincesByRegion(regionId),
    [regionId]
  );
  const effectiveProvince = provinceOptions.includes(province)
    ? province
    : (provinceOptions[0] || '');
  const cityOptions = useMemo(
    () => getCitiesByRegionAndProvince(regionId, effectiveProvince),
    [regionId, effectiveProvince]
  );
  const validCityId =
    cityOptions.some((c) => c.id === cityId) ? cityId : (cityOptions[0]?.id || 'cebu-city');

  useEffect(() => {
    if (initialListing) {
      const city = getCityById(initialListing.cityId);
      const regionIdVal = city?.regionId || DEFAULT_REGION;
      const provinces = getProvincesByRegion(regionIdVal);
      const provinceVal = city?.province && provinces.includes(city.province) ? city.province : (provinces[0] || '');
      const cities = getCitiesByRegionAndProvince(regionIdVal, provinceVal);
      const cityIdVal = cities.some((c) => c.id === initialListing.cityId) ? initialListing.cityId : (cities[0]?.id || 'cebu-city');
      setTitle(initialListing.title || '');
      setListingType(initialListing.listingType || 'sale');
      setPropertyType(initialListing.type || 'House');
      setPrice(String(initialListing.price || ''));
      setRegionId(regionIdVal);
      setProvince(provinceVal);
      setCityId(cityIdVal);
      setLocation(initialListing.location || '');
      const coords = initialListing.coordinates;
      setManualLat(coords && typeof coords.lat === 'number' ? String(coords.lat) : '');
      setManualLng(coords && typeof coords.lng === 'number' ? String(coords.lng) : '');
      setShowMapPicker(false);
      setBeds(initialListing.beds ? String(initialListing.beds) : '');
      setBaths(initialListing.baths ? String(initialListing.baths) : '');
      setSizeSqm(initialListing.sizeSqm ? String(initialListing.sizeSqm) : (initialListing.size ? String(parseInt(initialListing.size, 10) || '') : ''));
      setDescription(initialListing.description || '');
      setKeyMoney(initialListing.keyMoney != null ? String(initialListing.keyMoney) : '');
      setSecurityDeposit(initialListing.securityDeposit != null ? String(initialListing.securityDeposit) : '');
      setExtraFees(initialListing.extraFees || '');
      setAdvancePay(initialListing.advancePay != null ? String(initialListing.advancePay) : '');
      setBrokerFee(initialListing.brokerFee != null ? String(initialListing.brokerFee) : '');
      setAssociationFee(initialListing.associationFee != null ? String(initialListing.associationFee) : '');
      setUtilitiesIncluded(!!initialListing.utilitiesIncluded);
      setReservationFee(initialListing.reservationFee != null ? String(initialListing.reservationFee) : '');
      setFurnished(initialListing.furnished || '');
      setSold(!!initialListing.sold);
      setCurrentlyRented(!!initialListing.currentlyRented);
      setAvailableFrom(initialListing.availableFrom || '');
      const imgs = Array.isArray(initialListing.images) ? initialListing.images : [];
      const firstUrl = imgs.find((u) => typeof u === 'string' && (u.startsWith('http') || u.startsWith('https')));
      setImageUrl(firstUrl || '');
      setUploadedImages([]);
      setContactName(initialListing.contactInfo?.agentName || user?.name || '');
      setContactPhone(initialListing.contactInfo?.phone || '');
      setContactEmail(initialListing.contactInfo?.email || user?.email || '');
    }
  }, [initialListing, user?.name, user?.email]);

  const handleRegionChange = (e) => {
    const nextRegionId = e.target.value;
    setRegionId(nextRegionId);
    const nextProvinces = getProvincesByRegion(nextRegionId);
    const nextProvince = nextProvinces[0] || '';
    setProvince(nextProvince);
    const nextCities = getCitiesByRegionAndProvince(nextRegionId, nextProvince);
    setCityId(nextCities[0]?.id || 'cebu-city');
  };

  const handleProvinceChange = (e) => {
    const nextProvince = e.target.value;
    setProvince(nextProvince);
    const nextCities = getCitiesByRegionAndProvince(regionId, nextProvince);
    setCityId(nextCities[0]?.id || 'cebu-city');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - uploadedImages.length);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }
    const dataUrls = await Promise.all(files.map(resizeImageToDataUrl));
    setUploadedImages((prev) => [...prev, ...dataUrls.filter(Boolean)].slice(0, 5));
    e.target.value = '';
  };

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    const city = getCityById(validCityId);
    const cityName = city ? city.displayName : 'Cebu City';
    const locationTrimmed = location.trim();
    const latNum = parseFloat(manualLat);
    const lngNum = parseFloat(manualLng);
    const hasValidManual = !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
    let coords;
    if (hasValidManual) {
      coords = { lat: latNum, lng: lngNum };
    } else if (locationTrimmed) {
      const fromLookup = getBarangayCoordinates(locationTrimmed, cityName);
      if (fromLookup) {
        coords = fromLookup;
      } else {
        const geocoded = await geocodeAddress(locationTrimmed, cityName, city?.coordinates);
        coords = geocoded || city?.coordinates || { lat: 10.3157, lng: 123.8854 };
      }
    } else {
      coords = city?.coordinates || { lat: 10.3157, lng: 123.8854 };
    }
    const urlImages = imageUrl.trim() && (imageUrl.startsWith('http') || imageUrl.startsWith('https')) ? [imageUrl.trim()] : [];
    const defaultImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    const allImages = [...urlImages, ...uploadedImages].filter(Boolean);
    const listing = {
      ownerId: user?.id,
      title: title.trim() || 'Untitled listing',
      listingType,
      type: propertyType,
      price: parseInt(price, 10) || 0,
      cityId: validCityId || 'cebu-city',
      city: cityName,
      location: locationTrimmed || '',
      beds: parseInt(beds, 10) || 0,
      baths: parseInt(baths, 10) || 0,
      sizeSqm: parseInt(sizeSqm, 10) || 0,
      size: sizeSqm ? `${sizeSqm} sqm` : '',
      description: description.trim() || '',
      images: allImages.length ? allImages : [defaultImage],
      coordinates: coords,
      contactInfo: {
        agentName: contactName.trim() || user?.name,
        phone: contactPhone.trim() || '',
        email: contactEmail.trim() || user?.email || ''
      },
      keyMoney: keyMoney.trim() ? parseInt(keyMoney, 10) || null : null,
      securityDeposit: securityDeposit.trim() ? parseInt(securityDeposit, 10) || null : null,
      extraFees: extraFees.trim() || null,
      advancePay: advancePay.trim() ? parseInt(advancePay, 10) || null : null,
      brokerFee: brokerFee.trim() ? parseInt(brokerFee, 10) || null : null,
      associationFee: associationFee.trim() ? parseInt(associationFee, 10) || null : null,
      utilitiesIncluded: listingType === 'rent' ? utilitiesIncluded : null,
      reservationFee: reservationFee.trim() ? parseInt(reservationFee, 10) || null : null,
      furnished: furnished.trim() || null,
      sold: listingType === 'sale' ? sold : false,
      currentlyRented: listingType === 'rent' ? currentlyRented : false,
      availableFrom: listingType === 'rent' && availableFrom.trim() ? availableFrom.trim() : null
    };
    try {
      if (isEdit && initialListing) {
        await updateListing(initialListing.id, listing);
      } else {
        await addListing(listing);
      }
      setSubmitted(true);
      setTitle('');
      setPrice('');
      setLocation('');
      setManualLat('');
      setManualLng('');
      setBeds('');
      setBaths('');
      setSizeSqm('');
      setDescription('');
      setKeyMoney('');
      setSecurityDeposit('');
      setExtraFees('');
      setFurnished('');
      setSold(false);
      setCurrentlyRented(false);
      setAvailableFrom('');
      setImageUrl('');
      setUploadedImages([]);
    } catch (err) {
      setSubmitError(err?.userMessage || err?.message || err?.data?.error || err?.data?.message || 'Failed to save listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitted ? (
        <div className="text-success text-center py-4">
          <i className="fas fa-check-circle fa-2x mb-2" />
          <p className="mb-3">
            {isEdit ? 'Property updated.' : 'Your listing has been submitted and is pending approval. It will appear in the main feed once an admin approves it.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onSuccess?.()}>
            Back to listings
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <section className="add-property-form-section">
            <h6 className="add-property-section-title">Basic info</h6>
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Modern 2BR House in Cebu City"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Listing type</label>
                <select className="form-select" value={listingType} onChange={(e) => setListingType(e.target.value)}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Property type</label>
                <select className="form-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Price (₱) *</label>
              <input
                type="number"
                className="form-control"
                placeholder={listingType === 'rent' ? 'e.g. 15000' : 'e.g. 5000000'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                required
              />
              {listingType === 'rent' && <small className="text-muted">per month</small>}
            </div>
            {listingType === 'rent' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Key money (optional) ₱</label>
                  <input type="number" className="form-control" min="0" value={keyMoney} onChange={(e) => setKeyMoney(e.target.value)} placeholder="e.g. 50000" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Security deposit (optional) ₱</label>
                  <input type="number" className="form-control" min="0" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="e.g. 15000" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Extra fees (optional)</label>
                  <input type="text" className="form-control" value={extraFees} onChange={(e) => setExtraFees(e.target.value)} placeholder="e.g. Other fees (text)" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Advance pay (optional) ₱</label>
                  <input type="number" className="form-control" min="0" value={advancePay} onChange={(e) => setAdvancePay(e.target.value)} placeholder="e.g. 1 month" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Broker fee (optional) ₱</label>
                  <input type="number" className="form-control" min="0" value={brokerFee} onChange={(e) => setBrokerFee(e.target.value)} placeholder="e.g. 5000" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Association fee (optional) ₱</label>
                  <input type="number" className="form-control" min="0" value={associationFee} onChange={(e) => setAssociationFee(e.target.value)} placeholder="e.g. monthly" />
                </div>
                <div className="mb-3">
                  <label className="form-check">
                    <input type="checkbox" className="form-check-input" checked={utilitiesIncluded} onChange={(e) => setUtilitiesIncluded(e.target.checked)} />
                    <span className="form-check-label">Utilities included</span>
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-label">Reservation fee (optional) ₱</label>
                  <input type="number" className="form-control" min="0" value={reservationFee} onChange={(e) => setReservationFee(e.target.value)} placeholder="e.g. 5000" />
                </div>
              </>
            )}
          </section>

          <section className="add-property-form-section">
            <h6 className="add-property-section-title">Location</h6>
            <div className="mb-3">
              <label className="form-label">Region</label>
              <select className="form-select" value={regionId} onChange={handleRegionChange}>
                {REGIONS_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.displayName}</option>
                ))}
              </select>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Province</label>
                <select className="form-select" value={effectiveProvince} onChange={handleProvinceChange}>
                  {provinceOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">City</label>
                <select className="form-select" value={validCityId} onChange={(e) => setCityId(e.target.value)}>
                  {cityOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Location / Barangay</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Barangay Lahug"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowMapPicker((p) => !p)}>
                <i className="fas fa-map-marker-alt me-1" aria-hidden />
                {showMapPicker ? 'Hide map' : 'Pick location on map'}
              </button>
            </div>
            {showMapPicker && (
              <div className="mb-3">
                <MapPicker
                  center={
                    (location.trim() && getBarangayCoordinates(location.trim(), getCityById(validCityId)?.displayName || 'Cebu City'))
                    || getCityById(validCityId)?.coordinates
                    || { lat: 10.3157, lng: 123.8854 }
                  }
                  markerPosition={
                    manualLat && manualLng && !Number.isNaN(parseFloat(manualLat)) && !Number.isNaN(parseFloat(manualLng))
                      ? { lat: parseFloat(manualLat), lng: parseFloat(manualLng) }
                      : null
                  }
                  onPick={({ lat, lng }) => {
                    setManualLat(lat.toFixed(6));
                    setManualLng(lng.toFixed(6));
                  }}
                  height={240}
                />
              </div>
            )}
          </section>

          <section className="add-property-form-section">
            <h6 className="add-property-section-title">Property details</h6>
            <div className="row g-2 mb-3">
              <div className="col-4">
                <label className="form-label">Beds</label>
                <input type="number" className="form-control" min="0" value={beds} onChange={(e) => setBeds(e.target.value)} />
              </div>
              <div className="col-4">
                <label className="form-label">Baths</label>
                <input type="number" className="form-control" min="0" value={baths} onChange={(e) => setBaths(e.target.value)} />
              </div>
              <div className="col-4">
                <label className="form-label">Size (sqm)</label>
                <input type="number" className="form-control" min="0" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Furnished</label>
              <select className="form-select" value={furnished} onChange={(e) => setFurnished(e.target.value)}>
                <option value="">—</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            {listingType === 'sale' && (
              <div className="mb-3">
                <label className="form-check">
                  <input type="checkbox" className="form-check-input" checked={sold} onChange={(e) => setSold(e.target.checked)} />
                  <span className="form-check-label">Mark as sold (hidden from main feed; you still see it in My properties)</span>
                </label>
              </div>
            )}
            {listingType === 'rent' && (
              <>
                <div className="mb-3">
                  <label className="form-check">
                    <input type="checkbox" className="form-check-input" checked={currentlyRented} onChange={(e) => setCurrentlyRented(e.target.checked)} />
                    <span className="form-check-label">Currently being rented</span>
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-label">Next availability (optional)</label>
                  <input type="text" className="form-control" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} placeholder="e.g. March 2026 or Available now" />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe the property..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <section className="add-property-form-section">
            <h6 className="add-property-section-title">Images</h6>
            <div className="mb-3">
              <div className="add-property-image-upload mb-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-control"
                  onChange={handleImageUpload}
                  aria-label="Upload property images"
                />
                <small className="text-muted d-block mt-1">Up to 5 images. Resized automatically. Converted to WebP on the server.</small>
              </div>
              {uploadedImages.length > 0 && (
                <div className="add-property-thumbnails mb-2">
                  {uploadedImages.map((dataUrl, i) => (
                    <div key={i} className="add-property-thumb-wrap">
                      <div className="add-property-thumb-img">
                        <img src={dataUrl} alt={`Upload ${i + 1}`} />
                        <button
                          type="button"
                          className="add-property-thumb-remove"
                          onClick={() => removeUploadedImage(i)}
                          aria-label={`Remove image ${i + 1}`}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                            <line x1="4" y1="4" x2="12" y2="12" />
                            <line x1="12" y1="4" x2="4" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="add-property-form-section">
            <h6 className="add-property-section-title">Contact info</h6>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-control" placeholder="+63 917 123 4567" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </section>

          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Add property')}
          </button>
        </form>
      )}
      <ConfirmModal
        show={!!submitError}
        title="Error"
        message={submitError}
        alertOnly
        variant="danger"
        onConfirm={() => setSubmitError('')}
      />
    </>
  );
}

export default AddPropertyForm;
