const cloudinary = require("cloudinary");
const config = require("config");

cloudinary.config({
  // cloud_name: config.get("cloud_name"),
  // api_key: config.get("api_key"),
  // api_secret: config.get("api_secret"),
  cloud_name: "dc2fqa8y1",
  api_key: "425944639259227",
  api_secret: "pUMSQOxkvlc_0Y0b022OL6inO3g",
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
