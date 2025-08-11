import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async (localFilePath) => {
    try {

        // The problematic line has been removed from here
        if (!localFilePath) return null;
        console.log("path: ", localFilePath);

        let response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfully. Response:", response.url);
        fs.unlinkSync(localFilePath); // Clean up the local file after successful upload
        return response;
    } catch (error) {
        console.log("Error during upload:", error);
        fs.unlinkSync(localFilePath); // Clean up the local file on failure
        return null;
    }
}

export { uploadOnCloudinary };