-- Supplement to provision-psgc.js verify, which compares every name/type/parent.
-- Read-only integrity gate for the pinned initial IDE0177 production package.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT 'regions' AS geographic_level,count(*) AS actual,18 AS expected FROM regions
UNION ALL SELECT 'provinces',count(*),82 FROM provinces
UNION ALL SELECT 'cities_municipalities',count(*),1642 FROM cities
UNION ALL SELECT 'barangays',count(*),42010 FROM barangays;
SELECT locality_type,count(*) FROM cities GROUP BY locality_type ORDER BY locality_type;
SELECT code,name FROM cities WHERE province_id IS NULL ORDER BY code;
SELECT count(*) AS conflicting_global_codes FROM (
  SELECT code FROM (SELECT code FROM regions UNION ALL SELECT code FROM provinces
    UNION ALL SELECT code FROM cities UNION ALL SELECT code FROM barangays) x GROUP BY code HAVING count(*)<>1
) duplicates;
SELECT count(*) AS invalid_city_province_region FROM cities c JOIN provinces p ON p.id=c.province_id WHERE c.region_id<>p.region_id;
SELECT count(*) AS orphan_provinces FROM provinces p LEFT JOIN regions r ON r.id=p.region_id WHERE r.id IS NULL;
SELECT count(*) AS orphan_cities FROM cities c LEFT JOIN regions r ON r.id=c.region_id WHERE r.id IS NULL;
SELECT count(*) AS orphan_barangays FROM barangays b LEFT JOIN cities c ON c.id=b.city_id WHERE c.id IS NULL;
SELECT count(*) AS manila_barangays FROM barangays b JOIN cities c ON c.id=b.city_id WHERE c.code='1380600000';
DO $$
BEGIN
  IF (SELECT count(*) FROM regions)<>18 OR (SELECT count(*) FROM provinces)<>82
    OR (SELECT count(*) FROM cities)<>1642 OR (SELECT count(*) FROM barangays)<>42010
    OR (SELECT count(*) FROM cities WHERE locality_type='CITY')<>149
    OR (SELECT count(*) FROM cities WHERE locality_type='MUNICIPALITY')<>1493
    OR (SELECT count(*) FROM cities WHERE province_id IS NULL)<>43
    OR EXISTS(SELECT 1 FROM cities c JOIN provinces p ON p.id=c.province_id WHERE c.region_id<>p.region_id)
  THEN RAISE EXCEPTION 'PSGC pinned initial-reference integrity gate failed; do not rename/delete/reparent to force a pass'; END IF;
END $$;
COMMIT;
