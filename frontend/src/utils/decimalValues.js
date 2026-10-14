// Chỉ dùng chuỗi/BigInt cho tiền và so sánh decimal; không tính tổng hóa đơn ở client.
export function normalizeDecimal(value) {
  if (typeof value === "number" && !Number.isSafeInteger(value))
    throw new Error("Giá trị số cần được gửi dưới dạng chuỗi");
  const match = String(value ?? "").trim().match(/^([+-]?)([0-9]+)(?:\.([0-9]+))?(?:[eE]([+-]?[0-9]+))?$/);
  if (!match) throw new Error("Giá trị decimal không hợp lệ");
  const [, sign, integer, fraction = "", exp = "0"] = match;
  const exponent = Number(exp);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 100)
    throw new Error("Số mũ ngoài phạm vi");
  const digits = integer + fraction, point = integer.length + exponent;
  let whole, part;
  if (point <= 0) { whole = "0"; part = "0".repeat(-point) + digits; }
  else if (point >= digits.length) { whole = digits + "0".repeat(point - digits.length); part = ""; }
  else { whole = digits.slice(0, point); part = digits.slice(point); }
  whole = whole.replace(/^0+(?=[0-9])/, "");
  part = part.replace(/0+$/, "");
  const result = whole + (part ? "." + part : "");
  return sign === "-" && result !== "0" ? "-" + result : result;
}
export function validDecimal(value, integerDigits, scale, allowZero = true) {
  try {
    const n = normalizeDecimal(value);
    if (n.startsWith("-")) return false;
    const [whole, part = ""] = n.split(".");
    return whole.length <= integerDigits && part.length <= scale && (allowZero || n !== "0");
  } catch { return false; }
}
export function decimalUnits(value, scale = 3) {
  const n = normalizeDecimal(value), negative = n.startsWith("-");
  const [whole, part = ""] = n.replace(/^-/, "").split(".");
  if (part.length > scale) throw new Error("Quá nhiều chữ số thập phân");
  const units = BigInt(whole + part.padEnd(scale, "0"));
  return negative ? -units : units;
}
export function formatMoney(value) {
  if (value == null) return "—";
  const normalized = normalizeDecimal(value);
  if (normalized.includes(".")) throw new Error("Tiền phải là số nguyên đồng");
  return new Intl.NumberFormat("vi-VN").format(BigInt(normalized)) + " đ";
}
export function formatDecimal(value) {
  if (value == null) return "—";
  const [whole, fraction] = normalizeDecimal(value).split(".");
  return new Intl.NumberFormat("vi-VN").format(BigInt(whole)) + (fraction ? "," + fraction : "");
}
