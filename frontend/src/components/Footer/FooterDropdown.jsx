import Link from "next/link";
import { useState } from "react";
import ArrowIcon from "../icons/ArrowIcon";
import ArrowHeadIcon from "../icons/ArrowHeadIcon";

export default function FooterDropdown({ data }) {
  /**
   * data = {title: value, links: [{title: value, href: value}]}
   */

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={"footer-dropdown" + (isOpen ? "" : " hide")}>
      <div className="d-head" onClick={() => setIsOpen(!isOpen)}>
        <span>{data.title}</span>
        <ArrowHeadIcon/>
      </div>
      <div className="d-body">
        {data.links.map((link, index) => (
          <Link key={index} href={link.href}>
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
