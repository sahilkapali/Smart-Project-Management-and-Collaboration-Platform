import cloudinary from "../config/cloudinary";

export const uploadFileToCloudinary = (
  buffer: Buffer,
  originalName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      reject(new Error("File buffer is empty."));
      return;
    }

    const safeName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const publicId = `${Date.now()}-${safeName || "repository-version"}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "repository-versions",
        public_id: publicId,
        resource_type: "auto",
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          console.error("========== CLOUDINARY UPLOAD ERROR ==========");
          console.error(error);
          console.error("==============================================");

          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no result."));
          return;
        }

        if (!result.secure_url) {
          reject(new Error("Cloudinary did not return a secure URL."));
          return;
        }

        console.log("Cloudinary upload successful.");
        console.log("URL:", result.secure_url);

        resolve(result.secure_url);
      },
    );

    uploadStream.on("error", (error) => {
      console.error("Cloudinary upload stream error:", error);
      reject(error);
    });

    uploadStream.end(buffer);
  });
};
