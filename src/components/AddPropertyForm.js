import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import PropertyFormStep from './ui/PropertyFormStep';
import MapPicker from './MapPicker';
import ConfirmModal from './ConfirmModal';

const PROPERTY_TYPES = ['House', 'Apartment', 'Condo', 'Land', 'Boarding House', 'Room'];
const MAX_IMAGE_DIM = 1200;
const JPEG_QUALITY = 0.8;
const MAX_IMAGE_PAYLOAD_BYTES = 12 * 1024 * 1024;

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

function estimateDataUrlBytes(dataUrl) {
  const value = String(dataUrl || '');
  const commaIndex = value.indexOf(',');
  if (commaIndex < 0) return 0;
  const base64 = value.slice(commaIndex + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

const REGIONS_OPTIONS = philippineRegions.filter((r) => r.id !== 'all');
const REGIONS_WITH_CITIES = getRegionIdsWithCities();
const DEFAULT_REGION = REGIONS_WITH_CITIES[0] || 'region-vii';

function AddPropertyForm({ initialListing, onSuccess }) {
  const { user } = useAuth();
  const { addListing, updateListing } = useUserListings();
  const isEdit = !!initialListing;
  const [step, setStep] = useState(0);
  const formRef = useRef(null);
  const stepNames = ['The basics', 'Location', 'Your space', 'Costs & availability', 'Photos', 'Contact & review'];
  const nextStep = () => {
    if (formRef.current?.reportValidity()) setStep(value => Math.min(value + 1, 5));
  };
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
    if (step < 5) { nextStep(); return; }
    setSubmitError('');
    setSubmitting(true);
    const titleTrimmed = title.trim();
    const parsedPrice = parseInt(price, 10);
    const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice > 0;
    if (!titleTrimmed) {
      setSubmitError('Title is required.');
      setSubmitting(false);
      return;
    }
    if (!hasValidPrice) {
      setSubmitError('Price must be greater than 0.');
      setSubmitting(false);
      return;
    }

    const city = getCityById(validCityId);
    const cityName = city ? city.displayName : 'Cebu City';
    const locationTrimmed = location.trim();
    const latNum = parseFloat(manualLat);
    const lngNum = parseFloat(manualLng);
    const hasValidManual = !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
    if (!locationTrimmed && !hasValidManual) {
      setSubmitError('Add a location/barangay or pin the exact spot on the map.');
      setSubmitting(false);
      return;
    }

    const totalUploadPayload = uploadedImages.reduce((sum, imageDataUrl) => sum + estimateDataUrlBytes(imageDataUrl), 0);
    if (totalUploadPayload > MAX_IMAGE_PAYLOAD_BYTES) {
      setSubmitError('Selected images are too large. Remove some images or use smaller files before submitting.');
      setSubmitting(false);
      return;
    }

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
      title: titleTrimmed,
      listingType,
      type: propertyType,
      price: parsedPrice,
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
        <form ref={formRef} onSubmit={handleSubmit} className="bb-owner-form">
          <div className="bb-step-heading"><span>Step {step + 1} of 6</span><strong>{stepNames[step]}</strong></div>
          <div className="bb-step-progress" aria-hidden="true">{stepNames.map((name, index) => <span key={name} className={index <= step ? 'active' : ''} />)}</div>
          <PropertyFormStep active={step === 0} title={stepNames[0]}>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-1">Title *</label>
              <input id="listing-field-1"
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
                <label className="form-label" htmlFor="listing-field-2">Listing type</label>
                <select id="listing-field-2" className="form-select" value={listingType} onChange={(e) => setListingType(e.target.value)}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="listing-field-3">Property type</label>
                <select id="listing-field-3" className="form-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-4">Price (₱) *</label>
              <input id="listing-field-4"
                type="number"
                className="form-control"
                placeholder={listingType === 'rent' ? 'e.g. 15000' : 'e.g. 5000000'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="1"
                required
              />
              {listingType === 'rent' && <small className="text-muted">per month</small>}
            </div>
          </PropertyFormStep>
<PropertyFormStep active={step === 1} title={stepNames[1]}>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-5">Region</label>
              <select id="listing-field-5" className="form-select" value={regionId} onChange={handleRegionChange}>
                {REGIONS_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.displayName}</option>
                ))}
              </select>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label" htmlFor="listing-field-6">Province</label>
                <select id="listing-field-6" className="form-select" value={effectiveProvince} onChange={handleProvinceChange}>
                  {provinceOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="listing-field-7">City</label>
                <select id="listing-field-7" className="form-select" value={validCityId} onChange={(e) => setCityId(e.target.value)}>
                  {cityOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-8">Location / Barangay</label>
              <input id="listing-field-8"
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
          </PropertyFormStep>
<PropertyFormStep active={step === 2} title={stepNames[2]}>
            <div className="row g-2 mb-3">
              <div className="col-4">
                <label className="form-label">
                  <i className="fas fa-bed me-1" aria-hidden />
                  Bedrooms
                </label>
                <input type="number" className="form-control" min="0" aria-label="Bedrooms" value={beds} onChange={(e) => setBeds(e.target.value)} />
              </div>
              <div className="col-4">
                <label className="form-label">
                  <i className="fas fa-bath me-1" aria-hidden />
                  Bathrooms
                </label>
                <input type="number" className="form-control" min="0" aria-label="Bathrooms" value={baths} onChange={(e) => setBaths(e.target.value)} />
              </div>
              <div className="col-4">
                <label className="form-label">
                  <i className="fas fa-ruler-combined me-1" aria-hidden />
                  Size (sqm)
                </label>
                <input type="number" className="form-control" min="0" aria-label="Floor area in square metres" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-9">Furnished</label>
              <select id="listing-field-9" className="form-select" value={furnished} onChange={(e) => setFurnished(e.target.value)}>
                <option value="">—</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-11">Description</label>
              <textarea id="listing-field-11"
                className="form-control"
                rows={3}
                placeholder="Describe the property..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </PropertyFormStep>
<PropertyFormStep active={step === 3} title={stepNames[3]}>            {listingType === 'sale' && (
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
                  <label className="form-label" htmlFor="listing-field-10">Next availability (optional)</label>
                  <input id="listing-field-10" type="text" className="form-control" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} placeholder="e.g. March 2026 or Available now" />
                </div>
              </>
            )}
            {listingType === 'rent' && (
              <>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-12">Key money (optional) ₱</label>
                  <input id="listing-field-12" type="number" className="form-control" min="0" value={keyMoney} onChange={(e) => setKeyMoney(e.target.value)} placeholder="e.g. 50000" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-13">Security deposit (optional) ₱</label>
                  <input id="listing-field-13" type="number" className="form-control" min="0" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="e.g. 15000" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-14">Extra fees (optional)</label>
                  <input id="listing-field-14" type="text" className="form-control" value={extraFees} onChange={(e) => setExtraFees(e.target.value)} placeholder="e.g. Other fees (text)" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-15">Advance pay (optional) ₱</label>
                  <input id="listing-field-15" type="number" className="form-control" min="0" value={advancePay} onChange={(e) => setAdvancePay(e.target.value)} placeholder="e.g. 15000" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-16">Broker fee (optional) ₱</label>
                  <input id="listing-field-16" type="number" className="form-control" min="0" value={brokerFee} onChange={(e) => setBrokerFee(e.target.value)} placeholder="e.g. 5000" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-17">Association fee (optional) ₱</label>
                  <input id="listing-field-17" type="number" className="form-control" min="0" value={associationFee} onChange={(e) => setAssociationFee(e.target.value)} placeholder="e.g. monthly" />
                </div>
                <div className="mb-3">
                  <label className="form-check">
                    <input type="checkbox" className="form-check-input" checked={utilitiesIncluded} onChange={(e) => setUtilitiesIncluded(e.target.checked)} />
                    <span className="form-check-label">Utilities included</span>
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="listing-field-18">Reservation fee (optional) ₱</label>
                  <input id="listing-field-18" type="number" className="form-control" min="0" value={reservationFee} onChange={(e) => setReservationFee(e.target.value)} placeholder="e.g. 5000" />
                </div>
              </>
            )}
{listingType === 'sale' && <p className="bb-muted">Your asking price is set in The basics.</p>}</PropertyFormStep>
<PropertyFormStep active={step === 4} title={stepNames[4]}>
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
          </PropertyFormStep>
<PropertyFormStep active={step === 5} title={stepNames[5]}>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-19">Name</label>
              <input id="listing-field-19" type="text" className="form-control" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-20">Phone</label>
              <input id="listing-field-20" type="tel" className="form-control" placeholder="+63 917 123 4567" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="listing-field-21">Email</label>
              <input id="listing-field-21" type="email" className="form-control" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          <div className="bb-panel bb-listing-review"><h2>Ready for a fresh start?</h2><p><strong>{title}</strong></p><p>{listingType === 'rent' ? 'For rent' : 'For sale'} · {propertyType} · ₱{Number(price).toLocaleString()}</p><p>{location}, {getCityById(validCityId)?.displayName}</p><p>{uploadedImages.length + (imageUrl ? 1 : 0)} photos · {contactName || user?.name}</p><small>New listings are reviewed before appearing in search.</small></div></PropertyFormStep>

          <div className="bb-form-navigation">{step > 0 && <button type="button" className="bb-button bb-secondary" onClick={() => setStep(value => value - 1)} disabled={submitting}>Back</button>}
          <button type="submit" className="bb-button" disabled={submitting}>{step < 5 ? 'Continue' : submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit listing'}</button></div>
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
