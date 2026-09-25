export const missingPhoto = '/assets/photo-unavailable.svg';

export function handleListingImageError(event) {
  const image = event.currentTarget;
  if (image.getAttribute('src') === missingPhoto) return;
  image.alt = 'Photo unavailable';
  image.src = missingPhoto;
}
