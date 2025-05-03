// import { promises as fs } from 'fs';
// import xml from "@/sitemap.xml";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { convertXML, createAST } from "simple-xml-to-json";

export default function Sitemap() {
  // const file = await fs.readFile(process.cwd() + '/sitemap.xml', 'utf8');
  // console.log(file);

  // console.log(xml);

  const [linkData, setLinkData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const fileData = await loadFile();
    const myJson = convertXML(fileData);
    const links = [];

    for (const item of myJson.urlset.children) {
      links.push(item.url.children[0].loc.content);
    }

    setLinkData(links);
  }

  function extractText(url = "") {
    const parts = url.split("/");
    let text = parts[parts.length - 1];
    text = text.replaceAll("-", " ");
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text;
  }

  return (
    <div className="page">
      <Head>
        <title>UrbanChat.ai Sitemap - Navigate Our AI Chatbot Services & Resources</title>
        <meta
          name="description"
          content="Explore the complete sitemap of UrbanChat.ai. Discover our product features, blog content, and resources to streamline customer support, boost engagement, and drive business growth."
          key="desc"
        />
      </Head>
      <h1>Sitemap: Your Roadmap to Conversational AI Solutions</h1>
      <ol>
        {linkData.map((link, index) => (
          <li key={index}>
            <Link href={link}>{extractText(link)}</Link>
          </li>
        ))}
      </ol>

      <br />
      <br />
      <br />
    </div>
  );
}

async function loadFile() {
  const file = await fetch("/sitemap.xml");
  return await file.text();
}
