export const ignoredExtensions = [
  ".exe",
  ".dll",
  ".so",
  ".bin",
  ".class",
  ".jar",
  ".o",
  ".a",
  ".wasm",
  ".config",
  ".ini",
  ".toml",
  ".lock",
  ".env",
  ".iml",
  ".json",
  ".csv",
  ".xml",
  ".db",
  ".sqlite",
  ".log",
  ".pdf",
  ".md",
  ".markdown",
  ".rst",
  ".txt",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".rar",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".mp3",
  ".ico",
  ".DS_Store",
  ".swp",
  ".html",
];
export const ignoredFileNames = [
  "eslint.config.js",
  "prettier.config.js",
  "tailwind.config.js",
  "babel.config.js",
  "vite.config.js",
  "webpack.config.js",
  "jest.config.js",
  "tsconfig.json",
  "package-lock.json",
  "yarn.lock",
];

export function shouldIgnoreFile(fileName) {
  const lowerName = fileName.toLowerCase();
  if (ignoredFileNames.includes(lowerName)) return true;
  const dotIndex = lowerName.lastIndexOf(".");
  if (dotIndex == -1) return false;
  const ext = lowerName.slice(dotIndex);
  return ignoredExtensions.includes(ext);
}
