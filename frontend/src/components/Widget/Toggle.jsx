import React, { useEffect, useRef, useState } from "react";

import "../../styles/Widget/toggle.css";

export default function Toggle({ isOn, onToggle, disabled = false }) {
  const [isChecked, setIsChecked] = useState(isOn);

  useEffect(() => {
    setIsChecked(isOn);
  }, [isOn]);

  function onChange(value) {
    setIsChecked(value);
    if (onToggle) onToggle(value);
  }

  return (
    <div className="simple-checkbox">
      <input
        disabled={disabled}
        checked={isChecked}
        type="checkbox"
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="fill"></div>
      <div className="thumb"></div>
    </div>
  );
}
