import React from 'react';

const amount = (value) =>
  value == null || value === ''
    ? 'Not specified'
    : `₱${Number(value).toLocaleString()}`;

export default function PropertyCosts({ property }) {
  if (property.listingType !== 'rent')
    return (
      <section className="bb-detail-section bb-panel">
        <h2>Buying this home</h2>
        <div className="bb-cost-row">
          <span>Asking price</span>
          <strong>{amount(property.price)}</strong>
        </div>
        <p>
          Ask the owner for a complete breakdown of taxes, transfer charges and
          financing costs.
        </p>
      </section>
    );

  return (
    <section className="bb-detail-section bb-panel">
      <h2>Know the costs before you move.</h2>
      <p className="bb-muted">
        These are the individual amounts provided by the owner. BalhinBalay does
        not calculate an estimated move-in total.
      </p>
      {[
        ['Monthly rent', 'price'],
        ['Security deposit', 'securityDeposit'],
        ['Advance payment', 'advancePay'],
      ].map(([label, key]) => (
        <div className="bb-cost-row" key={key}>
          <span>{label}</span>
          <strong>{amount(property[key])}</strong>
        </div>
      ))}
      <details className="bb-fee-details">
        <summary>Other fees and monthly costs</summary>
        {[
          ['Key money', 'keyMoney'],
          ['Broker fee', 'brokerFee'],
          ['Association fee', 'associationFee'],
          ['Reservation fee', 'reservationFee'],
        ].map(([label, key]) => (
          <div className="bb-cost-row" key={key}>
            <span>{label}</span>
            <strong>{amount(property[key])}</strong>
          </div>
        ))}
        <div className="bb-cost-row">
          <span>Utilities</span>
          <strong>
            {property.utilitiesIncluded ? 'Included' : 'Separate'}
          </strong>
        </div>
        <p>{property.extraFees || 'Other fees not specified.'}</p>
      </details>
      <p className="bb-fine-print">
        Confirm every amount, recurring charge, credit and refund term with the
        owner before paying.
      </p>
    </section>
  );
}
