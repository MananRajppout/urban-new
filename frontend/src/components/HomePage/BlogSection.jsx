import React, { useEffect, useRef } from "react";
import "@/styles/HomePage/blog-section.css";
import BlogCard from "../blogs/BlogCard";

export default function BlogSection({ blogs }) {
  return (
    <>
      {blogs.length > 0 && (
        <section className="blog-section">
          <div className="page">
            <h1 className="primary-heading">Discover Our Latest Blogs</h1>
            <div className="blog-scroll">
              <div>
                {blogs.map((blog, index) => {
                  return <BlogCard blogData={blog} key={index} />;
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
