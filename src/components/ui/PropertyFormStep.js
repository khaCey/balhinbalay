import React from 'react';
export default function PropertyFormStep({ active, title, children }) {
  return (
    <fieldset className="bb-form-step" hidden={!active} disabled={!active}>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
