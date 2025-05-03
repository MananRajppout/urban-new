import img1 from "@/assets/brand/image1.png";
import img2 from "@/assets/brand/image2.png";
import img3 from "@/assets/brand/image3.png";
import img4 from "@/assets/brand/image4.png";
import "@/styles/HomePage/branding.css";

export default function BrandingSection() {
  return (
    <section className="branding">
      <div className="page">
        <h3>Join businesses already using AI chatbot</h3>
        <div className="img-holder">
          <a href="https://typerbuddy.com" target="_blank">
            <img src={img1.src} alt="typerbuddy.com" />
          </a>
          <img src={img2.src} alt="writing gpt" />
          <img src={img3.src} alt="flaxstudio.in" />
          <a href="https://flaxstudio.in" target="_blank">
            <img src={img4.src} alt="image" />
          </a>
        </div>
      </div>
    </section>
  );
}
