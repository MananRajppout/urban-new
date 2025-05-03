import { useEffect, useRef, useState } from "react";
import CloseIcon from "./icons/CloseIcon";

export default function ImportantMsg() {
  const [isClosed, setIsClosed] = useState(true);
  const msg = [
    "gpt-4o is now available in chatbot settings",
    "30-Days Money back guarantee",
    "Now you can integrate calendly and your customer can book appointment right through the chatbot",
  ];

  const [currentMsg, setCurrentMsg] = useState(0);
  const msgRef = useRef();

  function onClose() {
    setIsClosed(true);
    localStorage.setItem("important-msg-closed", "true");
  }

  function changeMsg() {
    setCurrentMsg((prev) => {
      let nextMsg = prev + 1;
      if (nextMsg >= msg.length) nextMsg = 0;
      return nextMsg;
    });
  }

  useEffect(() => {
    const closed = localStorage.getItem("important-msg-closed");
    setIsClosed(closed != null);

    if (msgRef.current) {
      msgRef.current.onanimationiteration = function () {
        changeMsg();
      };
    }
  }, []);

  function test() {
    console.log("animation end");
  }

  return (
    <div className={"important-msg" + (isClosed ? " hide" : "")}>
      <p ref={msgRef} className="animate">
        {msg[currentMsg]}
      </p>
      <button onClick={onClose} className="icon button hover">
        <CloseIcon />
      </button>
    </div>
  );
}
