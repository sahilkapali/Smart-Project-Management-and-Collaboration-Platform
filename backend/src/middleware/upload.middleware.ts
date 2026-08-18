import multer from "multer";

// ============================================================
// MEMORY STORAGE
// ============================================================
//
// Files are kept in memory temporarily and then uploaded to
// Cloudinary by the controller/service.
//
// This is appropriate for the current repository-release
// implementation because we limit uploads to 50 MB.
//

const storage = multer.memoryStorage();

// ============================================================
// MAX FILE SIZE
// ============================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ============================================================
// ALLOWED EXTENSIONS
// ============================================================

const ALLOWED_EXTENSIONS = [".zip", ".tar", ".gz", ".tgz", ".tar.gz"];

// ============================================================
// CHECK FILE EXTENSION
// ============================================================

const hasAllowedExtension = (filename: string): boolean => {
  const lowerCaseName = filename.toLowerCase();

  return ALLOWED_EXTENSIONS.some((extension) =>
    lowerCaseName.endsWith(extension),
  );
};

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  // --------------------------------------------------------
  // NO FILE
  // --------------------------------------------------------

  if (!file) {
    callback(null, false);

    return;
  }

  // --------------------------------------------------------
  // EXTENSION CHECK
  // --------------------------------------------------------

  if (!hasAllowedExtension(file.originalname)) {
    callback(
      new Error(
        "Only ZIP, TAR, GZ, TGZ and TAR.GZ source archives are allowed.",
      ),
    );

    return;
  }

  // --------------------------------------------------------
  // ACCEPT
  // --------------------------------------------------------

  callback(null, true);
};

// ============================================================
// MULTER INSTANCE
// ============================================================

const upload = multer({
  storage,

  limits: {
    // Maximum 50 MB
    fileSize: MAX_FILE_SIZE,

    // Only one file
    files: 1,
  },

  fileFilter,
});

export default upload;
