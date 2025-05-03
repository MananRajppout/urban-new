import React, { useEffect, useRef, useState } from "react";

import "../../styles/Widget/dropdown.css";
import { FaSortDown } from "react-icons/fa";
export default function Dropdown({
  items,
  onSelect,
  currentValue,
  primary = false,
  icon,
  text,
  style,
  placeholder,
  disabledItems = [],
  onRender,
}) {
  const [value, setValue] = useState(currentValue);

  function onChange(value) {
    setOpen(false);

    if (disabledItems.includes(value)) return;
    setValue(value);
    if (onSelect) onSelect(value);
  }

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, items]);

  const [open, setOpen] = useState(false);

  function getValueText(value) {
    const item = items.find((item) => item.value == value);
    return item ? item.name : "";
  }

  return (
    <div className="simple-dropdown " style={{ width: "fit-content" }}>
      {/* <select defaultValue={value} onChange={(e) => onChange(e.target.value)}>
        {items.map((value, index) =>  <option key={index} value={value.value}>{value.name}</option>)}

      </select> */}
      <div
        className={
          primary ? "dropdown-input primary hover" : "dropdown-input hover"
        }
        style={{ width: "fit-content" }}
        onClick={() => setOpen(!open)}
      >
        {icon}
        <span >
          {!getValueText(value) && !text && placeholder}
        </span>
        <span>{text ? text : getValueText(value)}</span>
        <FaSortDown className="mb-1 ml-3" />
      </div>
      {open && (
        <div className="dropdown-items-container">
          <div className="dropdown-items">
            {items.map((child, index) => (
              <span
                className={
                  disabledItems.includes(child.value) ? "disabled" : ""
                }
                onClick={(e) => onChange(child.value)}
                key={index}
                // style={style}
                data-value={child.value}
              >
                {onRender ? onRender(child) : child.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
