import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import "@/styles/Widget/light-dark-toggle.css";

export default function LightDarkToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  function changeTheme(isChecked) {
    // setTheme(resolvedTheme === "light" ? "dark" : "light")

    setTheme(isChecked ? "dark" : "light");
  }

  return (
    <div className="light-dark-toggle toggle-switch">
      <label className="switch-label">
        <input
          checked={resolvedTheme === "dark"}
          onChange={(e) => changeTheme(e.target.checked)}
          type="checkbox"
          className="checkbox"
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}
