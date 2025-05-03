const {Blogs, BlogsImageGallery} = require("./model");
const AWSHelper = require("../utils/aws_helper");
const catchAsyncError = require("../middleware/catchAsyncError");
const mongoose = require("mongoose");
const { generateSlug } = require("../utils/infra");


const awsHelper = new AWSHelper();

// Function to Extract Thumbnail Keys
// const extractThumbnailKeys = (blogs) => {
//   return blogs
//     .map((blog) => {
//       if (blog.thumbnail) {
//         return new URL(blog.thumbnail).pathname.substring(1);
//       }
//       return null;
//     })
//     .filter((key) => key !== null);
// };

// Fetch all blogs
exports.fetchBlogs = catchAsyncError(async (req, res) => {
  let { page, limit, fields } = req.query;

  // Default values
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let query = {}; // Initialize an empty query object

  // Check if search query parameters are provided
  if (req.query.search) {
      const searchQuery = req.query.search;
      query = {
          $or: [
              { title: { $regex: searchQuery, $options: "i" } }, // Search by title (case-insensitive)
              { description: { $regex: searchQuery, $options: "i" } }, // Search by description (case-insensitive)
              { author: { $regex: searchQuery, $options: "i" } }, // Search by author (case-insensitive)
          ],
      };
  }

  let totalBlogsQuery = Blogs.find(query);
  let blogsQuery = Blogs.find(query);

  // If limit is given as "*", return all blogs
  if (limit === '*') {
      totalBlogsQuery = totalBlogsQuery.countDocuments();
  } else {
      totalBlogsQuery = totalBlogsQuery.countDocuments();
      blogsQuery = blogsQuery.skip((page - 1) * limit).limit(limit);
  }

  let blogs;

  // let the frontend descides which fields it wants in response
  if (fields) {
      const selectedFields = fields.split(',').join(' ');
      blogsQuery = blogsQuery.select(selectedFields);
  } else {
      blogsQuery = blogsQuery.select('-content');
  }

  const totalBlogs = await totalBlogsQuery;
  const totalPages = Math.ceil(totalBlogs / limit);

  blogs = await blogsQuery;

  res.json({ data: blogs, totalBlogs, totalPages, currentPage: page });
});


// Fetch single blog with related or random posts
exports.fetchSingleBlog = catchAsyncError(async (req, res) => {
  const identifier = req.params.identifier;

  // Check if the identifier is a valid ObjectId
  let blog;
  if (mongoose.isValidObjectId(identifier)) {
      // Fetch blog by ID
      blog = await Blogs.findById(identifier);
  } else {
      // Fetch blog by slug
      blog = await Blogs.findOne({ slug: identifier });
  }

  if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
  }

  // Find related posts based on certain criteria
  let relatedPosts = await Blogs.find({
      _id: { $ne: blog._id }, // Exclude the current blog
      $or: [
        { tags: { $in: blog.tags } }, // Find posts with similar tags
        { author: blog.author }, // Find posts by the same author
        { title: { $regex: blog.title, $options: 'i' } } // Find posts with similar titles (case-insensitive)
    ],
  }).select('-content').limit(4); // Limit the number of related posts to 4 and exclude the content attribute

  // If the number of related posts found is less than 4, fetch random posts to fill the gap
  const remainingPostsCount = 4 - relatedPosts.length;
  if (remainingPostsCount > 0) {
      // Exclude the IDs of the related posts from the random post query
      const relatedPostIds = relatedPosts.map(post => post._id);
      const randomPosts = await Blogs.aggregate([
          { $match: { _id: { $nin: relatedPostIds } } }, // Exclude the IDs of the related posts
          { $sample: { size: remainingPostsCount } } // Randomly select posts
      ]).project('-content'); // Exclude the content attribute from random posts
      relatedPosts = relatedPosts.concat(randomPosts);
  }

  res.json({ blog, relatedPosts });
});


// Create Blog API
exports.createBlog = catchAsyncError(async (req, res) => {
    const {
      title,
      description,
      content,
      author,
      meta_description,
      visibility,
      tags,
      thumbnail
    } = req.body;

    // Check if all required parameters are present
    if (!title ) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Generate slug from title
    const slug = generateSlug(title);

    // Upload thumbnail to S3
    // let thumbnailUrl;
    // if(thumbnail){
    //   thumbnailUrl = await awsHelper.uploadObject(thumbnail);
    // }

    // Create new blog entry with S3 URL
    const newBlog = new Blogs({
      title,
      description,
      content,
      slug,
      author,
      thumbnail,
      meta_description,
      visibility,
      tags,
    });

    await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog created successfully", data: newBlog });
});

// Update Blog API
exports.updateBlog = catchAsyncError(async (req, res) => {
    const {
      title,
      description,
      content,
      author,
      meta_description,
      visibility,
      tags,
      thumbnail
    } = req.body;

    const blogId = req.params.blog_id;

    // Find the blog by ID
    let blog = await Blogs.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    if (title) {
      const slug = generateSlug(title);
      blog.slug = slug; // Update the slug if the title is updated
    }

    // Update blog fields
    blog.title = title;
    blog.description = description;
    blog.content = content;
    blog.author = author;
    blog.meta_description = meta_description;
    blog.visibility = visibility;
    blog.tags = tags;
    blog.thumbnail = thumbnail; 

    // If there's a new thumbnail, save it temporarily and upload it to S3
    // if (thumbnail) {
      // Upload thumbnail to S3
      // const thumbnailUrl = await awsHelper.uploadObject(thumbnail);

      // Delete the previous thumbnail from S3
      // if (blog.thumbnail) {
      //   const previousThumbnailKey = new URL(blog.thumbnail).pathname.substring(1);
      //   await awsHelper.deleteObject(previousThumbnailKey);
      // }

      // blog.thumbnail = thumbnailUrl; // Update thumbnail URL
    // }

    // Save the updated blog
    await blog.save();

    res.json({ message: "Blog updated successfully", data: blog });
});

/// Delete Blog API
exports.deleteSingleBlog = catchAsyncError(async (req, res) => {
    const blogId = req.params.blog_id;
    const blog = await Blogs.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Extract key of the corresponding thumbnail object from the blog
    // const thumbnailUrl = blog.thumbnail;
    // if (thumbnailUrl) {
    //   const thumbnailKey = new URL(thumbnailUrl).pathname.substring(1);

    //   // Delete the thumbnail object from S3 using AWSHelper
    //   await awsHelper.deleteObject(thumbnailKey);
    // }

    // Delete the blog from the database
    await Blogs.deleteOne({ _id: blogId });

    res.json({ message: "Blog deleted successfully" });
});

// Delete All Blogs
exports.deleteAllBlogs = catchAsyncError(async (req, res) => {
    // Fetch all blogs from the database
    // const blogs = await Blogs.find();

    // Extract keys of corresponding objects from the thumbnail URLs
    // const thumbnailKeys = extractThumbnailKeys(blogs);

    // Delete corresponding objects from the S3 bucket
    // if (thumbnailKeys.length > 0) {
    //   await awsHelper.deleteMultipleObjects(thumbnailKeys);
    // }

    // Delete all blogs from the database
    await Blogs.deleteMany({});

    res.json({
      message:
        "All blogs and corresponding objects deleted successfully from the S3 bucket",
    });
});

// Uploads an image to S3 and returns the URL of the uploaded image.
exports.uploadBlogContentImageToS3 = catchAsyncError( async (req, res) => {
    const image = req.files?.image;

    // Check if image is present in request
    if (!image) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Upload image to S3 using AWSHelper
    const imageUrl = await awsHelper.uploadObject(image,process.env.BLOGS_BUCKET_NAME);
    const imageKey = new URL(imageUrl).pathname.substring(1);

     // Save the uploaded image details to BlogsImageGallery schema
     const imageGalleryEntry = new BlogsImageGallery({
      image_public_url: imageUrl,
      image_key: imageKey, 
      file_name: req.body.file_name || image.name,
    });
    const savedImage = await imageGalleryEntry.save();
    res.status(200).json({ imageUrl, imageId: savedImage._id});
});

exports.fetchImagesFromGallery = catchAsyncError(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of images per page, default is 10

    const totalImages = await BlogsImageGallery.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);

    const skip = (page - 1) * limit; // Number of images to skip

    const images = await BlogsImageGallery.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    res.json({ data: images, totalImages, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


exports.deleteImageFromGallery = catchAsyncError(async (req, res) => {
  try {
    const imageId = req.params.imageId;

    // Check if the image exists in the gallery
    const image = await BlogsImageGallery.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete the image from the gallery
    await BlogsImageGallery.findByIdAndDelete(imageId);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


exports.deleteAllImageFromGallery = catchAsyncError(async (req, res) => {
    // Delete the image from the gallery
    await BlogsImageGallery.deleteMany({});

    res.status(200).json({ message: "All Images deleted successfully" });
});