import AddIcon from "@/icons/AddIcon";
import SubIcon from "@/icons/SubIcon";
import React, { useState } from "react";

export default function FaqChild({ title, content }) {
  const [show, setShow] = useState(false);

  return (
    <div className="faq-child">
      <div onClick={() => setShow(!show)} className="title active">
        <h3>{title}</h3>
        {show ? <SubIcon /> : <AddIcon />}
      </div>
      {show && <p>{content}</p>}
    </div>
  );
}
