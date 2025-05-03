import SearchIcon from "@/components/icons/SearchIcon";
import { useEffect, useRef, useState } from "react";
import "@/styles/blogs.css";
import BlogCard from "@/components/blogs/BlogCard";
import { getAllBlogs } from "@/lib/api/ApiExtra";
import Head from "next/head";

export async function getServerSideProps(context) {
  const res = await getAllBlogs("", 1);
  if (res.data) {
    let blogs = res.data.data.filter((blog) => blog.visibility === true);
    return { props: { blogsData: blogs, totalPageCount: res.data.totalPages } };
  }

  return { props: { blogsData: [], totalPageCount: 0 } };
}

export default function Blogs({ blogsData, totalPageCount }) {
  const [search, setSearch] = useState("");
  const previousSearch = useRef("");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState(blogsData);
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

  const totalPage = useRef(totalPageCount);

  useEffect(() => {
    if (previousSearch.current != search) {
      setPage(1);
      previousSearch.current = search;
      const timer = setTimeout(() => {
        onSearch();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [search]);

  async function onSearch() {
    if (loading) return;
    setLoading(true);

    const response = await getAllBlogs(search, page);
    if (response.data) {
      let blogs = response.data.data.filter((blog) => blog.visibility === true);
      setBlogs(blogs);
      totalPage.current = response.totalPages;
    }

    setLoading(false);
  }

  return (
    <div className="page extra-temp">
      <Head>
        <title>
        Explore AI Chatbot Insights & Trends | UrbanChat.ai Blog
        </title>
        <meta
          name="description"
          content="Explore the transformative power of AI chatbots on the UrbanChat.ai blog. Discover how our intelligent technology can revolutionize customer support, boost user engagement, and drive sales across industries. Unlock the future of business communication."
          key="desc"
        />
      </Head>
      <div>
        <h1>Explore the Latest Insights on Conversational AI and Chatbot Technology</h1>
        <div className="search-area">
          <SearchIcon />
          <input
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search blogs..."
            // style={{marginBottom:0}}
          />
        </div>
        <br />
        <br />
        <br />

        <div className="blogs-holder">
          {loading ? (
            <>
              <BlogCard />
              <BlogCard />
              <BlogCard />
            </>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => <BlogCard key={blog._id} blogData={blog} />)
          ) : (
            <p className="no-blog">No blog found</p>
          )}
        </div>
      </div>
    </div>
  );
}
