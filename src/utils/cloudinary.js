const cloudinary = require('cloudinary').v2;
const fs = require('fs');


// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!fs.existsSync(localFilePath)) return null;

    // Upload File on Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
      });

    // File has been uploaded to Cloudinary
    console.log(uploadResult.url);

    return uploadResult;
  } catch (err) {
    console.log("Failed to upload on Cloudinary!!", err);

    // Remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath);

    return null;
  }
}