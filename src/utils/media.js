import { URLS } from "../url";

export const resolveMediaUrl = (raw) => {
  if (!raw || typeof raw !== "string") return "";

  let path = raw.trim().replace(/\\/g, "/");
  if (!path) return "";

  path = path.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "http://187.127.143.141:4000");

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const base = (URLS.ImageUrl || URLS.Base_Url || "http://187.127.143.141:4000").replace(/\/+$/, "");
  const bare = path.replace(/^\/+/, "");

  if (!bare.includes("/")) {
    return `${base}/uploads/dashboard/${bare}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};

export const getMediaUrlCandidates = (raw) => {
  if (!raw) return [];
  const base = (URLS.ImageUrl || URLS.Base_Url || "http://187.127.143.141:4000").replace(/\/+$/, "");
  const trimmedRaw = String(raw).trim().replace(/\\/g, "/");
  if (!trimmedRaw) return [];

  const candidates = [];

  if (trimmedRaw.startsWith("http://") || trimmedRaw.startsWith("https://") || trimmedRaw.startsWith("data:")) {
    const primary = trimmedRaw.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "http://187.127.143.141:4000");
    candidates.push(primary);
    if (primary.includes("/public/")) {
      candidates.push(primary.replace("/public/", "/"));
    }
    if (!primary.includes("/uploads/")) {
      try {
        const u = new URL(primary);
        candidates.push(`${u.origin}/uploads/dashboard${u.pathname}`);
        candidates.push(`${u.origin}/uploads/banners${u.pathname}`);
        candidates.push(`${u.origin}/uploads/file_status${u.pathname}`);
        candidates.push(`${u.origin}/uploads${u.pathname}`);
      } catch {
        /* ignore */
      }
    }
  } else {
    const bare = trimmedRaw.replace(/^\/+/, "");
    if (!bare.includes("/")) {
      // Bare filename: dashboard banners are stored in uploads/dashboard/
      candidates.push(`${base}/uploads/dashboard/${bare}`);
      candidates.push(`${base}/public/uploads/dashboard/${bare}`);
      candidates.push(`${base}/uploads/banners/${bare}`);
      candidates.push(`${base}/public/uploads/banners/${bare}`);
      candidates.push(`${base}/uploads/file_status/${bare}`);
      candidates.push(`${base}/public/uploads/file_status/${bare}`);
      candidates.push(`${base}/uploads/${bare}`);
      candidates.push(`${base}/public/uploads/${bare}`);
      candidates.push(`${base}/${bare}`);
      candidates.push(`${base}/public/${bare}`);
    } else {
      if (bare.startsWith("uploads/")) {
        candidates.push(`${base}/${bare}`);
        candidates.push(`${base}/public/${bare}`);
      } else {
        candidates.push(`${base}/uploads/${bare}`);
        candidates.push(`${base}/public/uploads/${bare}`);
        candidates.push(`${base}/${bare}`);
      }
    }
  }

  return [...new Set(candidates.filter(Boolean))];
};

