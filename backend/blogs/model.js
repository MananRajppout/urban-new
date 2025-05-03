const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, 
    description: { type: String, required: false },
    content: { type: String,required: false},
    visibility: {type:Boolean, default: false},
    tags:{type:String, required: false},
    slug: { type: String, required: true },
    meta_description :{type: String, required: false},
    author: { type: String, required:false },
    thumbnail: { type: String, required: false } // Single image URL
  },
  { timestamps: true }
);

const blogsImageGallerySchema = new mongoose.Schema(
  {
    image_public_url: { type: String, required: true }, 
    image_key: { type: String,required: true},
    file_name: { type: String, required:true},
  },
  { timestamps: true }
);


const Blogs = mongoose.model("Blog", blogSchema);
const BlogsImageGallery = mongoose.model("BlogsImageGallery", blogsImageGallerySchema);

module.exports = {Blogs, BlogsImageGallery};
