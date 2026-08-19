import multer from "multer";

// ============================================================
// MEMORY STORAGE
// ============================================================
//
// The selected image is kept temporarily in memory.
// profileImage.service.ts uploads the Buffer to Cloudinary.
//

const storage = multer.memoryStorage();

// ============================================================
// MAX FILE SIZE
// ============================================================

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// ============================================================
// ALLOWED MIME TYPES
// ============================================================

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  // ----------------------------------------------------------
  // No file
  // ----------------------------------------------------------

  if (!file) {
    callback(null, false);
    return;
  }

  // ----------------------------------------------------------
  // Validate MIME type
  // ----------------------------------------------------------

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));

    return;
  }

  // ----------------------------------------------------------
  // Accept file
  // ----------------------------------------------------------

  callback(null, true);
};

// ============================================================
// MULTER INSTANCE
// ============================================================

const profileImageUpload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter,
});

export default profileImageUpload;
