import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import "../../styles/Dialog.css";
import { SketchPicker } from "react-color";

export default function ColorPickDialog({
  isDialogOpen,
  onDialogClose,
  onColorPick,
  defaultColor,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sketchPickerColor, setSketchPickerColor] = useState({
    r: "241",
    g: "112",
    b: "19",
    a: "1",
  });
  // destructuring rgba from state
  const { r, g, b, a } = sketchPickerColor;

  useEffect(() => setIsOpen(isDialogOpen), [isDialogOpen]);

  function close(className) {
    if (className == "dialog-outer") {
      onDialogClose();
    }
  }

  useEffect(() => {
    const color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    if (onColorPick) onColorPick(color);
  }, [sketchPickerColor]);

  return (
    <>
      {isOpen && (
        <div
          className="dialog-outer"
          onClick={(e) => close(e.target.className)}
        >
          <div className="">
            {/* <HexColorPicker color={color} onChange={setColor} /> */}
            <SketchPicker
              onChange={(color) => {
                setSketchPickerColor(color.rgb);
              }}
              color={sketchPickerColor}
            />
          </div>
        </div>
      )}
    </>
  );
}
