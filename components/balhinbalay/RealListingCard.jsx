import Link from 'next/link';
import {money} from './model';
import {Icon} from './ui';

export function RealListingFallback(){return <div className="real-listing-fallback" aria-label="No listing photo available"><strong>BalhinBalay</strong><span>Photo not available</span></div>;}

export default function RealListingCard({listing,compact=false}){
 const property=listing.property,location=listing.location;
 const href='/listing/'+listing.id;
 const price=<>{money(listing.price_amount)}{listing.transaction_type==='RENT'&&<small> / {listing.rental_terms?.pricing_period?.toLowerCase()||'period'}</small>}</>;
 if(compact)return <Link className="mini-card" href={href}><RealListingFallback/><span className="grow"><span className="price">{price}</span><span className="mini-title">{listing.title}</span><span className="mini-location">{location.barangay}, {location.city}</span></span><Icon name="chevron"/></Link>;
 return <article className="property-card"><div className="media"><Link href={href} aria-label={'View '+listing.title}><RealListingFallback/></Link><span className="badge">For {listing.transaction_type==='RENT'?'rent':'sale'}</span></div><div className="card-body"><div className="price">{price}</div><Link className="card-title" href={href}>{listing.title}</Link><p className="location">{location.barangay}, {location.city}</p><div className="facts"><span><Icon name="bed"/>{property.bedrooms??'—'} beds</span><span><Icon name="bath"/>{property.bathrooms??'—'} baths</span><span><Icon name="size"/>{property.floor_area_sqm??'—'} m²</span></div><div className="card-foot"><span className="micro muted">{property.property_type.toLowerCase()}</span></div></div></article>;
}
