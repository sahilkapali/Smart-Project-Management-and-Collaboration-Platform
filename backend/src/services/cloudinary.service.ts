import cloudinary from "../config/cloudinary";

export const uploadFileToCloudinary = (
  buffer: Buffer,
  originalName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const publicId = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "repository-versions",
        resource_type: "auto",
        public_id: `${Date.now()}-${publicId}`,
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result || !result.secure_url) {
          reject(new Error("Cloudinary did not return a secure URL."));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};