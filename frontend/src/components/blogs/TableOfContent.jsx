import { textToUrl } from "@/Utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "@/styles/table-of-content.css";

export default function TableOfContent() {
  const [tableData, setTableData] = useState([]);

  /**[{
        name: string,
        url: string,
        active: boolean}]
    */

  const headers = useRef([]);

  useEffect(() => {
    setupTableOfContent();
    window.addEventListener("scroll", () => autoActive());

    return () => {
      window.removeEventListener("scroll", () => autoActive());
    };
  }, []);

  function autoActive() {
    const scrollY = window.scrollY;
    const content = document.getElementById("blog-content-area");
    if (!content) return;

    // console.log(headers.current, scrollY, content.offsetHeight)
    const headers = content.querySelectorAll("h2");

    headers.forEach((element, index) => {
      const nextElement = headers[index + 1];
      const top = element.offsetTop - 100;
      const bottom = nextElement ? nextElement.offsetTop : content.offsetHeight;

      if (scrollY >= top) {
        setTableData((prev) => {
          const tableDataCopy = [...prev];

          for (const item of tableDataCopy) {
            item.url === element.id
              ? (item.active = true)
              : (item.active = false);
          }

          return tableDataCopy;
        });
      }
    });
  }

  function setupTableOfContent() {
    const content = document.getElementById("blog-content-area");
    if (!content) return;

    const arr = [];

    headers.current = content.querySelectorAll("h2");
    headers.current.forEach((element) => {
      element.id = textToUrl(element.innerText);
      arr.push({
        name: element.innerText,
        url: element.id,
        active: false,
      });
    });

    setTableData(arr);
  }
  return (
    <>
      {tableData.length > 0 && (
        <div className="table-of-content">
          <h4>Table of content</h4>
          <ul>
            {tableData.map((item, index) => (
              <li key={index} className={item.active ? "active" : ""}>
                <Link href={`#${item.url}`}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
