function mapListingRow(row) {
  const listing = {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    listingType: row.listing_type,
    type: row.type,
    price: Number(row.price),
    cityId: row.city_id,
    location: row.location || '',
    beds: row.beds || 0,
    baths: row.baths || 0,
    sizeSqm: row.size_sqm || 0,
    size: row.size_sqm ? (row.size_sqm + ' sqm') : '',
    description: row.description || '',
    images: Array.isArray(row.images) ? row.images : (row.images && typeof row.images === 'object' ? row.images : []),
    coordinates: row.coordinates || null,
    contactInfo: {
      agentName: row.contact_agent_name || '',
      phone: row.contact_phone || '',
      email: row.contact_email || ''
    },
    datePosted: row.date_posted,
    status: row.status || 'approved',
    keyMoney: row.key_money != null ? Number(row.key_money) : null,
    securityDeposit: row.security_deposit != null ? Number(row.security_deposit) : null,
    extraFees: row.extra_fees || null,
    advancePay: row.advance_pay != null ? Number(row.advance_pay) : null,
    brokerFee: row.broker_fee != null ? Number(row.broker_fee) : null,
    associationFee: row.association_fee != null ? Number(row.association_fee) : null,
    utilitiesIncluded: row.utilities_included != null ? !!row.utilities_included : null,
    reservationFee: row.reservation_fee != null ? Number(row.reservation_fee) : null,
    furnished: row.furnished || null,
    sold: !!row.sold,
    currentlyRented: !!row.currently_rented,
    availableFrom: row.available_from || null
  };
  if (!listing.images || listing.images.length === 0) {
    listing.images = ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'];
  }
  return listing;
}

module.exports = { mapListingRow };
