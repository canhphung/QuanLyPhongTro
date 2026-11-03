export const listingStatuses = {
  NHAP: "Nháp", CHO_DUYET: "Chờ duyệt", DA_DUYET: "Đã duyệt", TU_CHOI: "Từ chối", DA_AN: "Ẩn",
};
export function listingImages(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 10) throw new Error("Tối đa 10 ảnh.");
  const urls = lines.map((line) => {
    let url;
    try { url = new URL(line); } catch { throw new Error("URL ảnh không hợp lệ."); }
    if (url.protocol !== "https:" || url.username || url.password || url.hash || url.href.length > 2048)
      throw new Error("URL ảnh phải là HTTPS, không chứa tài khoản hoặc fragment.");
    return url.href;
  });
  if (new Set(urls).size !== urls.length) throw new Error("URL ảnh bị trùng.");
  return urls;
}
