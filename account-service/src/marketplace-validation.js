export const POLICY='marketplace_submission_v1';
export const TYPES=['CONDO','APARTMENT','HOUSE','TOWNHOUSE','ROOM','LAND'];
export const RELATIONSHIPS=['OWNER','AGENT_BROKER','PROPERTY_MANAGER','DEVELOPER_REPRESENTATIVE'];
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class MarketplaceError extends Error {
  constructor(status,code,message,fields) { super(message); Object.assign(this,{status,code,fields}); }
}
export const invalid=(field,rule)=>{throw new MarketplaceError(422,'INVALID_INPUT','Check the supplied fields.',{[field]:rule});};
export function object(value,allowed,field='request') {
  if(!value||typeof value!=='object'||Array.isArray(value))invalid(field,'Use a JSON object.');
  for(const key of Object.keys(value))if(!allowed.includes(key))invalid(`${field}.${key}`,'This field is not editable.');
  return value;
}
export function expected(value,field='expected_version') {
  if(!/^[1-9]\d{0,17}$/.test(String(value??'')))invalid(field,'Supply the current positive version.');
  return String(value);
}
const enums={property_type:TYPES,transaction_type:['RENT','SALE'],currency_code:['PHP'],
  furnishing:['FURNISHED','SEMI_FURNISHED','UNFURNISHED'],availability_status:['AVAILABLE','OCCUPIED'],
  pricing_period:['DAILY','WEEKLY','MONTHLY'],offering_mode:['PRIVATE_ROOM','BEDSPACE'],
  bathroom_access:['PRIVATE','SHARED','NONE'],relationship:RELATIONSHIPS,
  development_type:['CONDOMINIUM','APARTMENT_BUILDING','BOARDING_HOUSE','DEVELOPMENT']};
const money=new Set(['price_amount','deposit','advance','key_money','broker_fee','association_dues','reservation_fee','other_fee_amount']);
const area=new Set(['floor_area_sqm','lot_area_sqm']);
const counts=new Set(['bedrooms','bathrooms','parking_spaces','current_occupants','max_occupants','storeys','minimum_lease_months','year_built','year_completed','floor_count','floor_number']);
const booleans=new Set(['pets_allowed','cooking_allowed','visitors_allowed','utilities_included']);
const lengths={title:200,description:4000,payment_notes:1000,utilities_notes:500,other_fee_description:500,street_address:500,unit_identifier:100,room_identifier:100,name:200};
export const LISTING_FIELDS=['transaction_type','title','description','price_amount','currency_code','availability_status','available_from'];
export const PROPERTY_FIELDS=['property_type','development_id','parent_property_id','city_id','barangay_id','bedrooms','bathrooms','parking_spaces','floor_area_sqm','lot_area_sqm','furnishing'];
export const DETAIL_FIELDS=['floor_number','storeys','year_built','max_occupants','bathroom_access'];
export const RENT_FIELDS=['pricing_period','minimum_lease_months','deposit','advance','key_money','broker_fee','association_dues','reservation_fee','other_fee_amount','other_fee_description','utilities_notes','offering_mode','current_occupants','pets_allowed','cooking_allowed','visitors_allowed','utilities_included'];
export const PRIVATE_FIELDS=['street_address','unit_identifier','room_identifier'];
export function fields(value,allowed,name) {
  if(value===undefined)return {};
  object(value,allowed,name);
  for(const [key,item] of Object.entries(value)) {
    if(item===null)continue;
    if(enums[key]) { if(!enums[key].includes(item))invalid(`${name}.${key}`,'Choose a supported value.'); }
    else if(money.has(key)||area.has(key)) {
      const whole=area.has(key)?10:14;
      if(typeof item!=='string'||!new RegExp(`^(?:0|[1-9]\\d{0,${whole-1}})(?:\\.\\d{1,4})?$`).test(item))invalid(`${name}.${key}`,'Use a decimal string with at most four fractional digits.');
      if((key==='price_amount'||area.has(key))&&!/[1-9]/.test(item))invalid(`${name}.${key}`,'Must be positive.');
    } else if(counts.has(key)) {
      if(!Number.isInteger(item)||item>2147483647||item<(key==='floor_number'?-2147483648:['max_occupants','storeys','minimum_lease_months','year_built','year_completed','floor_count'].includes(key)?1:0))invalid(`${name}.${key}`,'Use an applicable integer count.');
      if(['year_built','year_completed'].includes(key)&&item>9999)invalid(`${name}.${key}`,'Use a valid year.');
    } else if(booleans.has(key)) { if(typeof item!=='boolean')invalid(`${name}.${key}`,'Use true, false or null.'); }
    else if(key.endsWith('_id')) { if(typeof item!=='string'||!UUID.test(item))invalid(`${name}.${key}`,'Use a real UUID.'); }
    else if(key==='available_from') {
      if(typeof item!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(item)||!Number.isFinite(Date.parse(item+'T00:00:00Z'))||new Date(item+'T00:00:00Z').toISOString().slice(0,10)!==item)invalid(`${name}.${key}`,'Use a valid YYYY-MM-DD date.');
    } else if(typeof item!=='string'||item.length>(lengths[key]||500))invalid(`${name}.${key}`,'Use text within the field limit.');
  }
  return {...value};
}
export function applicability(property,details,rental,transaction) {
  const type=property.property_type;
  const supplied=(value,key)=>value[key]!==null&&value[key]!==undefined;
  const deny=(value,keys,name)=>keys.forEach(key=>{if(supplied(value,key))invalid(`${name}.${key}`,'Not applicable to this property type.');});
  if(type==='LAND')deny(property,['bedrooms','bathrooms','parking_spaces','floor_area_sqm','furnishing'],'property');
  if(['CONDO','APARTMENT','ROOM'].includes(type))deny(property,['lot_area_sqm'],'property');
  if(type==='ROOM')deny(property,['bedrooms','bathrooms','parking_spaces'],'property');
  if(!['CONDO','APARTMENT'].includes(type))deny(details,['floor_number'],'details');
  if(!['HOUSE','TOWNHOUSE'].includes(type))deny(details,['storeys','year_built'],'details');
  if(type!=='ROOM') { deny(details,['max_occupants','bathroom_access'],'details'); deny(rental,['offering_mode','current_occupants'],'rental_terms'); }
  if(transaction!=='RENT'&&Object.keys(rental).length)invalid('rental_terms','Only RENT has rental terms.');
  if(details.max_occupants!=null&&rental.current_occupants!=null&&rental.current_occupants>details.max_occupants)invalid('rental_terms.current_occupants','Cannot exceed physical room capacity.');
}
export function submissionErrors(aggregate) {
  const {listing:l,property:p,details:d,rental_terms:r,authority:a,development}=aggregate;
  const errors={};
  const need=(key,value,rule)=>{if(value===null||value===undefined||typeof value==='string'&&!value.trim())errors[key]=rule;};
  for(const key of ['title','description','transaction_type','price_amount','currency_code'])need(`listing.${key}`,l[key],'Required for first submission.');
  need('property.property_type',p.property_type,'Choose a supported physical type.');
  need('property.city_id',p.city_id,'Choose a recognised city.'); need('property.barangay_id',p.barangay_id,'Choose a recognised barangay in that city.');
  if(a.status!=='active'||a.verification_state!=='verified')errors.authority='Exact property authority must be manually approved and active.';
  if(['CONDO','APARTMENT'].includes(p.property_type)) {
    const required=p.property_type==='CONDO'?'CONDOMINIUM':'APARTMENT_BUILDING';
    if(!development||development.development_type!==required||development.archived_at)errors['property.development_id']='Choose the matching building context.';
  }
  if(p.property_type==='ROOM'&&!p.parent_property_id&&!p.development_id)errors['property.parent_property_id']='A room requires a residential parent or building context.';
  if(p.property_type==='ROOM'&&p.development_id&&(!development||!['CONDOMINIUM','APARTMENT_BUILDING','BOARDING_HOUSE'].includes(development.development_type)))errors['property.development_id']='Choose a supported residential building.';
  if(p.property_type==='LAND')need('property.lot_area_sqm',p.lot_area_sqm,'Positive lot area is required for Land.');
  if(l.transaction_type==='RENT') {
    need('rental_terms.pricing_period',r.pricing_period,'Choose daily, weekly or monthly pricing.');
    if(p.property_type==='ROOM') {
      for(const key of ['max_occupants','bathroom_access'])need(`details.${key}`,d[key],'Required for ROOM rental.');
      for(const key of ['offering_mode','current_occupants'])need(`rental_terms.${key}`,r[key],'Required for ROOM rental.');
    }
  }
  return errors;
}
export function snapshot(aggregate) {
  const pick=(value,keys)=>Object.fromEntries(keys.map(k=>[k,value[k]??null]));
  return {listing:pick(aggregate.listing,LISTING_FIELDS),property:pick(aggregate.property,PROPERTY_FIELDS),
    details:pick(aggregate.details,DETAIL_FIELDS),rental_terms:pick(aggregate.rental_terms,RENT_FIELDS),
    sale_terms:pick(aggregate.sale_terms,['payment_notes']),development:aggregate.development?pick(aggregate.development,['name','development_type']):null};
}
