import { decimalUnits, normalizeDecimal, validDecimal } from "./decimalValues.js";
export function receiptLimit(remaining, oldAmount = "0") {
  const limit = decimalUnits(remaining, 0) + decimalUnits(oldAmount, 0);
  return (limit > 9999999999999999999n ? 9999999999999999999n : limit).toString();
}
export function validReceipt(amount, limit) {
  return validDecimal(amount, 19, 0, false) && decimalUnits(amount, 0) <= decimalUnits(limit, 0);
}
export function receiptAmount(amount) { return normalizeDecimal(amount); }
// Backend DATETIME lưu giờ Việt Nam, không tự đổi sang múi giờ máy người dùng.
export function receiptTime(value) {
  return value ? String(value).slice(0, 19).replace("T", " ") + " (VN)" : "—";
}
