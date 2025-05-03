import react, { useEffect, useState } from "react";
import "@/styles/HomePage/cookie-bar.css";

export default function CookieBar() {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    const cookie = localStorage.getItem("cookie");
    if (cookie) return;

    setTimeout(() => {
      setIsShowing(true);
    }, 2000);

    // return () => clearTimeout(timer);
  }, []);

  function onAccept() {
    localStorage.setItem("cookie", "accepted");
    setIsShowing(false);
  }

  function onDecline() {
    setIsShowing(false);
  }

  return (
    <div className={isShowing ? "cookies-bar show" : "cookies-bar"}>
      <div className="page">
        <div>
          <p>
            Welcome to UrbanChat! We use cookies to improve your experience. By
            using our site, you agree to our Cookie Policy. Enjoy chatting with
            our ChatGPT-powered bot!
          </p>
          <div className="buttons">
            <button onClick={onDecline} className="outline hover">
              Decline
            </button>
            <button onClick={onAccept} className="primary hover">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
