import Link from "next/link";
import blogImg from "../../assets/blog_img.jpg";
import ArrowIcon from "../icons/ArrowIcon";
import { formatDateString } from "@/Utils";
import "@/styles/blogs.css";

export default function BlogCard({ blogData }) {
  /*
  {
    "_id": "663548d74762838e4d6387a6",
    "title": "blog-title",
    "description": "blog-description",
    "content": "blog-content",
    "visibility": false,
    "tags": "blog-tag",
    "slug": "blog-title",
    "meta_description": "blog-meta-desc",
    "author": "blog-author",
    "thumbnail": "https://urbanchat-public-repo.s3.eu-south-1.amazonaws.com/dfc94d16-b0cf-4d87-83eb-44c2c3c578f8-argonaut.png",
    "createdAt": "2024-05-03T20:28:07.160Z",
    "updatedAt": "2024-05-03T20:28:07.160Z",
  }
  */

  function generateBlogLink() {
    return `/blogs/${blogData.slug}`;
  }
  return (
    <div className={blogData ? "blog-card" : "blog-card skeleton"}>
      {blogData && (
        <>
          <img
            src={blogData.thumbnail ? blogData.thumbnail : blogImg.src}
            alt="blog"
          />
          <div className="details">
            <h4>{blogData.title}</h4>
            <span className="date">{formatDateString(blogData.updatedAt)}</span>
            <p>{blogData.description}</p>
            <Link href={generateBlogLink()} >
              <button className="secondary text-sm">
                Read more <ArrowIcon />
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
