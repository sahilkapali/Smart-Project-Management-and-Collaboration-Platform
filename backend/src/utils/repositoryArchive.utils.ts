import AdmZip from "adm-zip";
import path from "path";

export interface ExtractedRepositoryFile {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  content?: string;
  isBinary: boolean;
}

const MAX_ENTRIES = 2000;
const MAX_TOTAL_EXTRACTED_SIZE = 100 * 1024 * 1024;
const MAX_TEXT_FILE_SIZE = 1 * 1024 * 1024;

const MIME_TYPES: Record<string, string> = {
  ".ts": "text/typescript",
  ".tsx": "text/typescript",
  ".js": "text/javascript",
  ".jsx": "text/javascript",
  ".json": "application/json",
  ".html": "text/html",
  ".css": "text/css",
  ".scss": "text/scss",
  ".md": "text/markdown",
  ".txt": "text/plain",
  ".py": "text/x-python",
  ".java": "text/x-java",
  ".c": "text/x-c",
  ".cpp": "text/x-c++",
  ".h": "text/x-c",
  ".hpp": "text/x-c++",
  ".sql": "application/sql",
  ".xml": "application/xml",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".env": "text/plain",
};

const isUnsafePath = (filePath: string) => {
  const normalized = filePath.replace(/\\/g, "/");

  return (
    normalized.startsWith("/") ||
    normalized.includes("../") ||
    normalized.includes("/..") ||
    normalized === ".."
  );
};

const isTextBuffer = (buffer: Buffer) => {
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));

  return !sample.includes(0);
};

export const extractRepositoryZip = (
  buffer: Buffer,
): ExtractedRepositoryFile[] => {
  if (!buffer || buffer.length === 0) {
    throw new Error("EMPTY_ARCHIVE");
  }

  const zip = new AdmZip(buffer);

  const entries = zip.getEntries();

  if (entries.length > MAX_ENTRIES) {
    throw new Error(
      `ARCHIVE_TOO_LARGE: maximum ${MAX_ENTRIES} files are allowed.`,
    );
  }

  const files: ExtractedRepositoryFile[] = [];

  let totalSize = 0;

  for (const entry of entries) {
    if (entry.isDirectory) {
      continue;
    }

    const rawPath = entry.entryName;

    if (isUnsafePath(rawPath)) {
      throw new Error(`UNSAFE_ARCHIVE_PATH: ${rawPath}`);
    }

    const normalizedPath = path.posix
      .normalize(rawPath.replace(/\\/g, "/"))
      .replace(/^\.\/+/, "");

    if (!normalizedPath || normalizedPath === ".") {
      continue;
    }

    const data = entry.getData();

    const size = data.length;

    totalSize += size;

    if (totalSize > MAX_TOTAL_EXTRACTED_SIZE) {
      throw new Error("ARCHIVE_EXTRACTED_SIZE_LIMIT");
    }

    const name = normalizedPath.split("/").pop() || normalizedPath;

    const extension = path.extname(name).toLowerCase();

    const mimeType = MIME_TYPES[extension] || "application/octet-stream";

    const isText = size <= MAX_TEXT_FILE_SIZE && isTextBuffer(data);

    files.push({
      name,
      path: normalizedPath,
      size,
      mimeType,
      content: isText ? data.toString("utf8") : undefined,
      isBinary: !isText,
    });
  }

  return files;
};
