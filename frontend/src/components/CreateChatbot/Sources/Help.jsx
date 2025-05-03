import DeleteIcon from "@/components/icons/DeleteIcon";
import AddIcon from "@/icons/AddIcon";
import React, { useEffect, useState } from "react";

export default function Help({ qaData, setQaData, count, onAddMore, onRemove }) {

  const [openItem, setOpenItem] = useState(-1);
  function onQuestionTyping(index, text) {
    setQaData((old) => {
      const temp = structuredClone(old);
      temp.isChanged = true;
      temp.questions[index] = text;
      return temp;
    });
  }

  function onAnswerTyping(index, text) {
    setQaData((old) => {
      const temp = structuredClone(old);
      temp.isChanged = true;
      temp.answers[index] = text;
      return temp;
    });
  }

  return (
    <div className="qa-parent">
      <div className="qa-holder thin">
        {qaData.questions.map((item, index) => (
          <div key={index} className={openItem == index ? "active qa-item" : "qa-item"}>
            <div className="title">
              <h4>Question</h4>
              <button onClick={() => onRemove(index)} className="hover">
                <DeleteIcon />
              </button>
            </div>
            <input
              value={item}
              onChange={(e) => onQuestionTyping(index, e.target.value)}
              placeholder="Write question..."
            />

            <br />
            <br />
            <h4>Answer</h4>
            <textarea
              value={qaData.answers[index]}
              onChange={(e) => onAnswerTyping(index, e.target.value)}
              rows={6}
              placeholder="Write here something..."
            ></textarea>
          </div>
        ))}
      </div>

      <br />
      <button onClick={onAddMore} className="outline hover add">
        <AddIcon /> Add More
      </button>
    </div>
  );
}
