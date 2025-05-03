import React from "react";
import Link from "next/link";

const NavItem = ({ icon: Icon, label, to, isActive }) => {
  return (
    <Link
      href={to}
      className={`no-underline flex items-center py-3 px-6 rounded-md transition-all duration-200 group ${
        isActive
          ? "bg-glass-panel/40 border-l-3 border-accent-teal"
          : "hover:bg-glass-panel/20"
      }`}
    >
      <Icon
        className={`w-5 h-5 mr-3 ${
          isActive ? "text-accent-teal" : "text-gray-400 group-hover:text-white"
        }`}
      />
      <span
        className={`text-sm font-medium ${
          isActive ? "text-white" : "text-gray-400 group-hover:text-white"
        }`}
      >
        {label}
      </span>
    </Link>
  );
};

export default NavItem;
