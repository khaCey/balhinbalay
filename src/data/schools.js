/**
 * Philippine schools/universities with coordinates for "nearby properties" search.
 * Start with a small set; can be extended or moved to API later.
 */
export const schools = [
  { id: 'usc-cebu', name: 'University of San Carlos (Cebu)', coordinates: { lat: 10.3188, lng: 123.8934 }, city: 'Cebu City', regionId: 'region-vii' },
  { id: 'uc-cebu', name: 'University of Cebu', coordinates: { lat: 10.3242, lng: 123.9081 }, city: 'Cebu City', regionId: 'region-vii' },
  { id: 'cdu', name: 'Cebu Doctors\' University', coordinates: { lat: 10.3194, lng: 123.8942 }, city: 'Cebu City', regionId: 'region-vii' },
  { id: 'ctu', name: 'Cebu Technological University', coordinates: { lat: 10.3500, lng: 123.9167 }, city: 'Cebu City', regionId: 'region-vii' },
  { id: 'up-cebu', name: 'University of the Philippines Cebu', coordinates: { lat: 10.3534, lng: 123.9092 }, city: 'Cebu City', regionId: 'region-vii' },
  { id: 'up-manila', name: 'University of the Philippines Manila', coordinates: { lat: 14.57913, lng: 120.98342 }, city: 'Manila', regionId: 'ncr' },
  { id: 'ateneo-manila', name: 'Ateneo de Manila University', coordinates: { lat: 14.6389, lng: 121.0778 }, city: 'Quezon City', regionId: 'ncr' },
  { id: 'dlsu', name: 'De La Salle University Manila', coordinates: { lat: 14.5650, lng: 120.9933 }, city: 'Manila', regionId: 'ncr' },
  { id: 'ust', name: 'University of Santo Tomas', coordinates: { lat: 14.6102, lng: 120.9894 }, city: 'Manila', regionId: 'ncr' }
];

export function getSchoolById(id) {
  return schools.find((s) => s.id === id) || null;
}
