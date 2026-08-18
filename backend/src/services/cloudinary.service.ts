import cloudinary from "../config/cloudinary";

// ============================================================
// UPLOAD BUFFER TO CLOUDINARY
// ============================================================

export const uploadFileToCloudinary = (
  buffer: Buffer,

  originalName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // ======================================================
    // VALIDATE BUFFER
    // ======================================================

    if (!buffer || buffer.length === 0) {
      reject(new Error("File buffer is empty."));

      return;
    }

    // ======================================================
    // CLEAN ORIGINAL FILE NAME
    // ======================================================

    const cleanedName = originalName

      .replace(/\.[^/.]+$/, "")

      .replace(/[^a-zA-Z0-9-_]/g, "-")

      .replace(/-+/g, "-")

      .replace(/^-|-$/g, "");

    // ======================================================
    // FALLBACK NAME
    // ======================================================

    const safeName = cleanedName || "repository-version";

    // ======================================================
    // UNIQUE PUBLIC ID
    // ======================================================

    const publicId = `${Date.now()}-${safeName}`;

    // ======================================================
    // CLOUDINARY UPLOAD STREAM
    // ======================================================

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "repository-versions",

        public_id: publicId,

        resource_type: "raw",

        overwrite: false,
      },

      (error, result) => {
        // =================================================
        // CLOUDINARY ERROR
        // =================================================

        if (error) {
          console.error("Cloudinary upload failed:", error);

          reject(error);

          return;
        }

        // =================================================
        // NO RESULT
        // =================================================

        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));

          return;
        }

        // =================================================
        // NO SECURE URL
        // =================================================

        if (!result.secure_url) {
          reject(new Error("Cloudinary did not return a secure URL."));

          return;
        }

        // =================================================
        // SUCCESS
        // =================================================

        if (process.env.NODE_ENV !== "production") {
          console.log("Cloudinary upload successful.");
        }

        resolve(result.secure_url);
      },
    );

    // ======================================================
    // STREAM ERROR
    // ======================================================

    uploadStream.on("error", (error) => {
      console.error("Cloudinary stream error:", error);

      reject(error);
    });

    // ======================================================
    // SEND BUFFER
    // ======================================================

    uploadStream.end(buffer);
  });
};
