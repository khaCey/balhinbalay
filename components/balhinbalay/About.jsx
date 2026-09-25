'use client';
import React from 'react';
import {useApp} from './model';
import {Button} from './ui';

export default function About(){
  const {nav}=useApp();
  return <div className="narrow about-page">
    <div className="page-head"><h1>About BalhinBalay</h1></div>
    <div className="panel">
      <p>BalhinBalay is a property discovery beta for exploring places to rent or buy. You can search by city, keyword or nearby school, browse results on a list or map, and open property details.</p>
      <p>This preview currently uses sample listings and illustrative photos. Prices, availability, locations and Lister details have not been verified as real listings. Real account registration may be available, but messages and listing submissions are not available.</p>
      <p>Changes you make in the preview stay in this browser. Please do not enter private information.</p>
      <Button onClick={()=>nav('search')}>Explore places</Button>
    </div>
  </div>;
}
