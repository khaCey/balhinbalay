'use client';
import React from 'react';
import {useApp} from './model';
import {Button} from './ui';

export default function About(){
  const {nav}=useApp();
  return <div className="narrow about-page">
    <div className="page-head"><h1>About BalhinBalay</h1></div>
    <div className="panel">
      <p>BalhinBalay is a property discovery beta for exploring real places to rent or buy. Search by city or keyword, browse results in a list or map, and open listing details.</p>
      <p>Public search shows listings that currently meet marketplace publication rules. Only confirmed public locations have map pins, and photos may be unavailable. Older isolated sample property and comparison pages remain illustrative.</p>
      <p>Some preview features stay in this browser. Please do not enter private information into those features.</p>
      <Button onClick={()=>nav('search')}>Explore places</Button>
    </div>
  </div>;
}
