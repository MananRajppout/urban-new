import { formatDateString } from "@/Utils";
import blogImg from "@/assets/blog_img.jpg";
import BlogCard from "@/components/blogs/BlogCard";
import TableOfContent from "@/components/blogs/TableOfContent";
import EyeIcon from "@/components/icons/EyeIcon";
import { getSingleBlog } from "@/lib/api/ApiExtra";
import "@/styles/blogs.css";
import Markdown from "markdown-to-jsx";
import Head from "next/head";
import "@/styles/extra-temp.css";

/*
{
    "blog": {
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
    },
    "relatedPosts": [
        {
            "_id": "66354aa24762838e4d6387be",
            "title": "blog-title",
            "description": "blog-description",
            "visibility": false,
            "tags": "blog-tag",
            "slug": "blog-title",
            "meta_description": "blog-meta-desc",
            "author": "blog-author",
            "thumbnail": "https://urbanchat-public-repo.s3.eu-south-1.amazonaws.com/e3d76f97-fa89-4268-8e0a-9b8a3437fa25-argonaut.png",
            "createdAt": "2024-05-03T20:35:46.322Z",
            "updatedAt": "2024-05-03T20:35:46.322Z",
        }
    ]
}*/

export async function getServerSideProps(context) {
  const res = await getSingleBlog(context.query.blog_path);
  if (res.data) {
    if (res.data.blog.visibility === false) return { notFound: true };
    return { props: { post: res.data } };
  }
  return { notFound: true };
}

function Blog({ post }) {
  function getTags() {
    return post.blog.tags.split(",");
  }

  console.log(post);

  function getPostCount() {
    let count = 0;
    for (const iterator of post.relatedPosts) {
      if (iterator.visibility === true && iterator._id != post.blog._id) {
        count++;
      }
    }

    return count;
  }

  return (
    <div className="page extra-temp blog">
      <Head>
        <title>
          {post.blog.title} | {post.blog.author}
        </title>
        <meta
          name="description"
          content={
            post.blog.meta_description
              ? post.blog.meta_description
              : post.blog.description
          }
          key="desc"
        />
      </Head>
      <div className="blog-page">
        <div className="blog-area">
          <div className="left">
            {/* intro */}
            <div className="blog-intro">
              <img
                src={post.blog.thumbnail ? post.blog.thumbnail : blogImg.src}
                alt={post.blog.title}
              />
              <h1>{post.blog.title}</h1>
              <p>{post.blog.description}</p>
              <span className="author">
                by <b>{post.blog.author}</b>
              </span>
              <span className="date">
                {formatDateString(post.blog.updatedAt)}
              </span>
            </div>

            {/* content */}
            <br />
            <br />
            <div id="blog-content-area" className="blog-content">
              <Markdown>{post.blog.content}</Markdown>
            </div>
          </div>
          <div className="right">
            <div>
              <TableOfContent />

              <div className="tags">
                <h4>Tags</h4>
                <div>
                  {getTags().map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {getPostCount() > 0 && (
          <div className="related-post">
            <h3>Related Post</h3>
            <div className="post-holder">
              <div>
                {post.relatedPosts.map((item, index) => {
                  if (item.visibility === true && item._id != post.blog._id)
                    return <BlogCard key={index} blogData={item} />;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Blog.getInitialProps = async ({ query }) => {
//   const res = await getSingleBlog(query.blog_path);
//   return { post: res.data };
// };

export default Blog;
