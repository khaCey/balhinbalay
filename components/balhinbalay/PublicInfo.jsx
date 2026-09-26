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
  <section><h2>About this beta</h2><p>BalhinBalay operates this beta service. It shows sample listings and illustrative property information. Public account registration uses a separate server-side account service and persists account records there. There are no Lister accounts, real property submissions, payments or delivered in-app messages in this beta.</p></section>
  <section><h2>Information in your browser</h2><p>Sample searches, recently viewed places and comparisons use this device. They are not synced with an account. Older browser-only saved items, messages and listing edits are not restored as account data. Search and page navigation also use browser history state. You can clear this device data through your browser’s site-data controls.</p></section>
  <section><h2>Outside resources</h2><p>Public traffic to balhinbalay.com is routed through Cloudflare HTTPS and Cloudflare Tunnel before reaching the BalhinBalay Site on the owner-controlled PC. When you open the map, your browser requests map tiles from OpenStreetMap. The site also requests DM Sans font files from Google Fonts. Cloudflare, OpenStreetMap and Google may receive technical request information such as your IP address while serving those requests. Listing photos and the map software are served with this site. The current application has no analytics or event-tracking collector.</p></section>
  <section><h2>Accounts</h2><p>Registration sends your email address and password over the public HTTPS connection to the BalhinBalay Site, which forwards account requests to the private account service on the same owner-controlled PC. The account service stores a normalised email address, an Argon2id password hash, account status and account creation, update and email-verification dates. It does not store your plaintext password. Verification and password-reset actions send email to the address you supply. Single-use action-token digests, action status and expiry data, request-limit records and revocable session records are stored server-side. After sign-in, your browser receives an HttpOnly, Secure, SameSite=Lax session cookie while the server stores a digest of the session credential. The session lasts up to 14 days unless you sign out, reset your password or the service revokes it. Saved places, saved searches, messaging and listing management are not available in this beta. Contact {email} for account questions.</p></section>
  <section><h2>Emailing us</h2><p>If you email {email}, the message and the contact details you include are sent through your email provider to BalhinBalay. A reporting action only prepares an email in your email app; you decide whether to send it. For questions about this policy, use the same address.</p></section>
</InfoPage>;}

export function Terms(){return <InfoPage title="Terms / Site Use">
  <section><h2>Using the beta</h2><p>BalhinBalay is a property discovery beta. The current listings are sample and illustrative. Property titles, prices, availability, Lister identities and map locations are not real property advertisements and should not be relied on as current property or market information.</p></section>
  <section><h2>What actions do</h2><p>Account registration requires email verification before you can sign in. Registration does not enable Lister publishing or property transactions. You cannot complete a property transaction through this beta. Viewing requests, messages and saved places cannot be created here. Compare and recently viewed are local utilities on this device. A report action opens an email draft addressed to {email}; it is sent only if you send it from your email app.</p></section>
  <section><h2>Changes and questions</h2><p>Beta features and sample information may change as development continues. For questions or problems with the site, contact {email}.</p></section>
</InfoPage>;}
