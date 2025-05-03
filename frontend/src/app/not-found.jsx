// import {notFound} from "next/navigation"
"use client";
import Link from "next/link";
import "@/styles/error.css";
import "@/styles/page.css";
import astro from "@/assets/astro.svg";
import astroLayer from "@/assets/astro_layer.svg";
import Head from "next/head";

// If loading a variable font, you don't need to specify the font weight

export default function NotFound() {
  return (
    <main>
      <Head>
        <title>404 Not Found</title>
        <meta
          name="description"
          content="The page you are looking for is not exist yet"
          key="desc"
        />
      </Head>
      <div className="error-page">
        <div className="page">
          <div className="center">
            <div className="left">
              <h1>404 - error</h1>
              <h2>PAGE NOT FOUND</h2>
              <p>Your search has ventured beyond the known universe.</p>
              <Link href={"/"}>
                <button className="hover outline">Back To Home</button>
              </Link>
            </div>

            <div className="right">
              <img
                className="layer"
                src={astroLayer.src}
                alt="Astronaut layer"
              />
              <img className="astro" src={astro.src} alt="Astronaut" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
