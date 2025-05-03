import React, { useEffect, useRef, useState } from "react";

import "../../styles/Widget/changeable-input.css";
import arrowIcon from "../../assets/Icons/arrow.svg";

export default function ChangeableInput({
  value = 0,
  extension = "",
  label,
  onValueChange,
}) {
  const [count, setCount] = useState(value);
  const [text, setText] = useState("0");

  useEffect(() => {
    setText(count + " " + extension);
  }, []);

  function manipulateText(increment = 0) {
    let num = parseInt(text);
    if (num) {
      num += increment;
    } else {
      num = increment;
    }

    setCount(num);
    setText(num + " " + extension);

    if (onValueChange) onValueChange(num);
  }

  function onChange(value) {
    const count = parseInt(text);
    setCount(count);
    setText(value);
  }

  function increment() {
    manipulateText(1);
  }
  function decrement() {
    manipulateText(-1);
  }

  return (
    <div className="changeable-input">
      <span>{label}</span>
      <hr />
      <div className="right">
        <input
          value={text}
          type="text"
          onBlur={() => manipulateText(0)}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="buttons">
          <img src={arrowIcon.src} onClick={increment} />
          <img src={arrowIcon.src} onClick={decrement} />
        </div>
      </div>
    </div>
  );
}
