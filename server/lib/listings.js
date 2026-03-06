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
    status: row.status || 'approved'
  };
  if (!listing.images || listing.images.length === 0) {
    listing.images = ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'];
  }
  return listing;
}

module.exports = { mapListingRow };
