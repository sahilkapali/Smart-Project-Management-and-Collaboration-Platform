import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName) {
  throw new Error("CLOUDINARY_CLOUD_NAME is missing in .env");
}

if (!apiKey) {
  throw new Error("CLOUDINARY_API_KEY is missing in .env");
}

if (!apiSecret) {
  throw new Error("CLOUDINARY_API_SECRET is missing in .env");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

console.log("Cloudinary configured successfully.");
console.log("Cloud Name:", cloudName);
console.log("API Key:", apiKey ? "Loaded" : "Missing");
console.log("API Secret:", apiSecret ? "Loaded" : "Missing");

export default cloudinary;
