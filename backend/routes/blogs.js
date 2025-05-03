const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const {
  fetchBlogs,
  fetchSingleBlog,
  createBlog,
  fetchSingleBlogBySlug,
  updateBlog,
  deleteSingleBlog,
  deleteAllBlogs,
  uploadBlogContentImageToS3,
  fetchImagesFromGallery,
  deleteImageFromGallery,
  deleteAllImageFromGallery,
} = require("../blogs/controller");

const router = express.Router();

// blogs
router.route("/fetch-blogs").get(fetchBlogs);
router.route("/fetch-blog/:identifier").get(fetchSingleBlog);
router
  .route("/create-blog")
  .post(checkSessionExpiration(["admin"]), createBlog);
router
  .route("/update-blog/:blog_id")
  .put(checkSessionExpiration(["admin"]), updateBlog);
router
  .route("/delete-blog/:blog_id")
  .delete(checkSessionExpiration(["admin"]), deleteSingleBlog);
router
  .route("/delete-all-blogs")
  .delete(checkSessionExpiration(["admin"]), deleteAllBlogs);
router
  .route("/upload-blog-content-image-to-s3")
  .post(checkSessionExpiration(["admin"]), uploadBlogContentImageToS3);

// image gallery of blogs
router
  .route("/gallery/fetch-images")
  .get(checkSessionExpiration(["admin"]), fetchImagesFromGallery);
router
  .route("/gallery/delete-image/:imageId")
  .delete(checkSessionExpiration(["admin"]), deleteImageFromGallery);
router
  .route("/gallery/delete-all-images")
  .delete(checkSessionExpiration(["admin"]), deleteAllImageFromGallery);

module.exports = router;
