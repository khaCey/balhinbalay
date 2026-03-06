export const formatPrice = (item) => {
  if (item.listingType === 'rent') {
    return `₱${item.price.toLocaleString()}/month`;
  } else {
    return `₱${item.price.toLocaleString()}`;
  }
};
