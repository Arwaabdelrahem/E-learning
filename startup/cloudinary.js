const cloudinary = require("cloudinary");
const config = require("config");

cloudinary.config({
  cloud_name: config.get("cloud_name"),
  api_key: config.get("api_key"),
  api_secret: config.get("api_secret"),
});

exports.cloudUpload = (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({ image: result.url });
      },
      { resource_type: "auto" }
    );
  });
};
