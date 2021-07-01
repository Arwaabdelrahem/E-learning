let cloudinary = require("cloudinary");
let cloudinaryStorage = require("multer-storage-cloudinary");

// cloudinary.config({
//   cloud_name: process.env.cloud_name,
//   api_key: process.env.api_key,
//   api_secret: process.env.api_secret,
// });

module.exports = cloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "auto",
  },
});
