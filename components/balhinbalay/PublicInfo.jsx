'use client';
import React from 'react';
import {useApp} from './model';
import {Button} from './ui';

const email = <a href="mailto:support@balhinbalay.com">support@balhinbalay.com</a>;

function InfoPage({title,children}){
  const {nav}=useApp();
  return <div className="narrow public-info">
    <div className="page-head"><h1>{title}</h1></div>
    <div className="panel">{children}<Button onClick={()=>nav('search')}>Explore sample places</Button></div>
  </div>;
}

export function Contact(){return <InfoPage title="Contact BalhinBalay">
  <p>BalhinBalay operates this beta service. For general questions, beta feedback, problems with the site, or to report something shown in the beta, email {email}.</p>
  <p>Current properties are sample listings. There are no real property owners to contact through this preview. If your email app opens, you still need to send your message yourself.</p>
</InfoPage>;}

export function Privacy(){return <InfoPage title="Privacy Policy">
  <section><h2>About this beta</h2><p>BalhinBalay operates this beta service. It shows sample listings and illustrative property information. Account registration requires a separate account service; if registration is available, it stores an email address, password hash, verification and session records. There are no Lister accounts, real property submissions, payments or delivered in-app messages in this beta.</p></section>
  <section><h2>Information in your browser</h2><p>The preview saves demo data in your browser’s local storage, including favourites, searches, recent activity, demo profile and listing edits, and any demo messages you enter. Search and page navigation also use browser history state. These demo actions do not send your entries to a Lister or create an account. You can remove saved demo data using the browser’s site-data controls; the demo profile also offers a delete action. Please do not enter private information into demo forms.</p></section>
  <section><h2>Outside resources</h2><p>When you open the map, your browser requests map tiles from OpenStreetMap. The site also requests DM Sans font files from Google Fonts. Browsers and those providers may receive technical request information such as your IP address. Listing photos and the map software are served with this site. The current application has no analytics or event-tracking collector. When you sign in, an HttpOnly, Secure session cookie is used for your account.</p></section>
  <section><h2>Accounts, when available</h2><p>Registration sends your email address and password over a secure connection to the separate account service. It stores a normalised email address, an Argon2id password hash and the dates of account creation and email verification. Verification and password reset send email to the address you supply. One-time action digests, request limits and revocable session records are stored server-side. The session cookie lasts up to 14 days unless you sign out, reset your password or the service revokes it. Your saved sample places, searches and messages remain browser-local demo data even when you sign in. Contact {email} for account questions.</p></section>
  <section><h2>Emailing us</h2><p>If you email {email}, the message and the contact details you include are sent through your email provider to BalhinBalay. A reporting action only prepares an email in your email app; you decide whether to send it. For questions about this policy, use the same address.</p></section>
</InfoPage>;}

export function Terms(){return <InfoPage title="Terms / Site Use">
  <section><h2>Using the beta</h2><p>BalhinBalay is a property discovery beta. The current listings are sample and illustrative. Property titles, prices, availability, Lister identities and map locations are not real property advertisements and should not be relied on as current property or market information.</p></section>
  <section><h2>What actions do</h2><p>If account registration is enabled, verify your email before signing in. Account registration does not enable Lister publishing or property transactions. You cannot complete a property transaction through this beta. Viewing requests, messages, saved places and other demo actions may stay only in your browser; they do not reach a real Lister. A report action opens an email draft addressed to {email}; it is sent only if you send it from your email app.</p></section>
  <section><h2>Changes and questions</h2><p>Beta features and sample information may change as development continues. For questions or problems with the site, contact {email}.</p></section>
</InfoPage>;}
