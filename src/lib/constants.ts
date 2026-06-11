export const APP_NAME = "DocShare";
export const APP_DESCRIPTION = "A modern document publishing and sharing platform";

export const ITEMS_PER_PAGE = 20;
export const SEARCH_DEBOUNCE_MS = 300;

export const SUPPORTED_FILE_TYPES = {
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/html",
    "text/plain",
  ],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/x-msvideo", "video/webm"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
};

export const ALL_ACCEPTED_TYPES = [
  ...SUPPORTED_FILE_TYPES.document,
  ...SUPPORTED_FILE_TYPES.image,
  ...SUPPORTED_FILE_TYPES.video,
  ...SUPPORTED_FILE_TYPES.audio,
];

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const FILE_TYPE_ICONS: Record<string, string> = {
  "application/pdf": "file-text",
  "application/msword": "file-text",
  "text/html": "code",
  "text/plain": "file-text",
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "audio/mpeg": "music",
  "audio/wav": "music",
};

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Tags", href: "/tags" },
  { label: "Search", href: "/search" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
  { label: "Documents", href: "/admin/documents", icon: "files" },
  { label: "Categories", href: "/admin/categories", icon: "folder-tree" },
  { label: "Tags", href: "/admin/tags", icon: "tags" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Permissions", href: "/admin/permissions", icon: "shield" },
  { label: "Analytics", href: "/admin/analytics", icon: "bar-chart-3" },
];
