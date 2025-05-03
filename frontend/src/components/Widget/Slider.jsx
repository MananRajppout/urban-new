import React, { useRef, useState, useEffect } from "react";

import "../../styles/Widget/slider.css";

export default function Slider({ value, onProgress, texts }) {
  const [progress, setProgress] = useState(0);

  function onChange(value) {
    if (onProgress) onProgress(value);
    setProgress(value);
  }

  useEffect(() => {
    onChange(value);
  }, [value]);
  return (
    <div className="slider">
      <div className="slider-holder">
        <input
          onChange={(e) => onChange(e.target.value)}
          value={0}
          min={0}
          max={100}
          type="range"
        />
        <span className="fill" style={{ width: progress + "%" }}></span>
        <span className="outline"></span>
      </div>
      <div className="text-holder">
        {texts.map((value, index) => <span key={index}>{value}</span>)}
      </div>
    </div>
  );
}
