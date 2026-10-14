// Kiểm tra UI bằng API giả lập, không gọi backend thật hay tạo dữ liệu ngoài.
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const path = require("node:path");
const localRequire = createRequire(path.join(__dirname, "../package.json"));
const { chromium } = process.env.PLAYWRIGHT_MODULE ? require(process.env.PLAYWRIGHT_MODULE) : localRequire("playwright");
const base = process.env.FRONTEND_URL || "http://127.0.0.1:5173";
const money = (value) => new Intl.NumberFormat("vi-VN").format(BigInt(value)) + " đ";

(async () => {
  const options = { headless: true };
  if (process.env.SPARTICUZ_MODULE) {
    const loaded = require(process.env.SPARTICUZ_MODULE);
    const runtime = loaded.default ?? loaded;
    options.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || await runtime.executablePath(); options.args = runtime.args;
  }
  const browser = await chromium.launch(options);
  let debugPage, debugRequests, debugErrors;
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const errors = [], requests = [], unexpected = [];
    debugPage = page; debugRequests = requests; debugErrors = errors;

    page.on("pageerror", (error) => errors.push(error.message));
    let account = null, expired = false;
    const ownerA = { id: 1, hoTen: "Chủ A", email: "a@example.test", vaiTros: ["CHU_TRO"] };
    const ownerB = { id: 2, hoTen: "Chủ B", email: "b@example.test", vaiTros: ["CHU_TRO"] };
    const seeker = { id: 3, hoTen: "Người tìm phòng", email: "seeker@example.test", vaiTros: ["NGUOI_THUE"] };
    const house = { id: 1, tenNhaTro: "Nhà A", diaChi: "Địa chỉ thử" };
    const room = { id: 1, nhaTroId: 1, tenNhaTro: "Nhà A", soPhong: "P101", dienTich: 25, giaThue: "9007199254740993", trangThai: "DANG_THUE" };
    const contract = { id: 7, phongId: 1, nhaTroId: 1, tenNhaTro: "Nhà A", soPhong: "P101",
      ngayBatDau: "2026-08-01", ngayKetThuc: "2027-08-01", ngayKetThucThucTe: null,
      giaThueThoaThuan: "9007199254740993", tienCoc: "9007199254740993", trangThai: "DANG_HIEU_LUC" };
    const bills = [{ id: 12, hopDongId: 7, nhaTroId: 1, tenNhaTro: "Nhà A", soPhong: "P101",
      kyThanhToan: "2026-10-01", ngayLap: "2026-10-01", hanThanhToan: "2026-10-10",
      tienPhong: "100", tongTien: "100", daThanhToan: "0", conThieu: "100",
      coKhoanThu: false, coTheChinhSua: true, trangThai: "CHUA_THANH_TOAN", chiTietHoaDons: [] }];
    const services = [{ id: 3, tenDichVu: "Phụ phí", donViTinh: "lần", donGiaHienTai: "4",
      tinhTheoChiSo: false, dangHoatDong: true }];
    const receipts = [];
    function recalc(bill) {
      bill.tongTien = (BigInt(bill.tienPhong) + bill.chiTietHoaDons.reduce((sum, line) => sum + BigInt(line.thanhTien), 0n)).toString();
      bill.daThanhToan = receipts.filter((row) => row.hoaDonId === bill.id).reduce((sum, row) => sum + BigInt(row.soTien), 0n).toString();
      bill.conThieu = (BigInt(bill.tongTien) - BigInt(bill.daThanhToan)).toString();
      bill.coKhoanThu = bill.daThanhToan !== "0"; bill.coTheChinhSua = !bill.coKhoanThu;
      bill.trangThai = !bill.coKhoanThu ? "CHUA_THANH_TOAN" : bill.conThieu === "0" ? "DA_THANH_TOAN" : "THANH_TOAN_MOT_PHAN";
    }
    function paged(rows, url) {
      const size = Number(url.searchParams.get("size") || 10), number = Number(url.searchParams.get("page") || 0);
      return { content: rows.slice(number * size, (number + 1) * size), number, size,
        totalElements: rows.length, totalPages: Math.ceil(rows.length / size),
        first: number === 0, last: (number + 1) * size >= rows.length };
    }
    await context.route("**/api/**", async (route) => {
      const req = route.request(), url = new URL(req.url()), method = req.method(), endpoint = url.pathname;
      if (!endpoint.startsWith("/api/")) return route.continue();
      let data;
      try { data = req.postDataJSON(); } catch { data = req.postData(); }
      requests.push({ endpoint, method, query: url.searchParams.toString(), data, headers: req.headers() });
      const send = (status, body) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      if (endpoint === "/api/auth/csrf") return send(200, { headerName: "X-CSRF-TOKEN", token: "mock-csrf" });
      if (!["GET", "HEAD"].includes(method) && req.headers()["x-csrf-token"] !== "mock-csrf")
        return send(403, { message: "Missing CSRF" });
      if (endpoint === "/api/auth/login") {
        const input = new URLSearchParams(req.postData()), email = input.get("email");
        account = email === ownerB.email ? ownerB : email === seeker.email ? seeker : ownerA;
        expired = false; return send(200, { message: "Đăng nhập thành công" });
      }
      if (endpoint === "/api/auth/logout") { account = null; return send(200, {}); }
      if (endpoint === "/api/auth/me") return account && !expired ? send(200, account) : send(401, { message: "Cần đăng nhập" });
      if (!account || expired) return send(401, { message: "Cần đăng nhập" });
      if (!account.vaiTros.includes("CHU_TRO")) return send(403, { message: "Không có quyền" });
      const isA = account.id === 1;
      if (endpoint === "/api/dashboard") return send(200, { tongPhong: isA ? 1 : 0, phongTrong: 0,
        phongDangThue: isA ? 1 : 0, phongBaoTri: 0, phongNgungHoatDong: 0, tongHoSoNguoiThue: 0,
        hopDongDangHieuLuc: isA ? 1 : 0, tongHoaDon: isA ? bills.length : 0,
        hoaDonConNo: isA ? bills.filter((x) => x.conThieu !== "0").length : 0,
        tongCongNo: isA ? bills.reduce((sum, bill) => sum + BigInt(bill.conThieu), 0n).toString() : "0",
        daThuTrongThang: isA ? receipts.reduce((sum, row) => sum + BigInt(row.soTien), 0n).toString() : "0",
        thang: url.searchParams.get("thang") || "2026-10" });
      if (endpoint === "/api/nha-tro") return send(200, paged(isA ? [house] : [], url));
      if (endpoint === "/api/phong") return send(200, isA ? [room] : []);
      if (endpoint === "/api/phong/phan-trang") return send(200, paged(isA ? [room] : [], url));
      if (endpoint === "/api/hop-dong") return send(200, isA ? [contract] : []);
      if (endpoint === "/api/hop-dong/phan-trang") return send(200, paged(isA ? [contract] : [], url));
      if (endpoint === "/api/hop-dong/7") return send(isA ? 200 : 404, isA ? contract : { message: "Không tìm thấy" });
      if (endpoint === "/api/nguoi-thue") return send(200, []);
      if (endpoint === "/api/dich-vu/phan-trang") return send(200, paged(isA ? services : [], url));
      if (endpoint === "/api/dich-vu" && method === "GET") return send(200, isA ? services : []);
      if (endpoint === "/api/dich-vu" && method === "POST") {
        const saved = { ...data, id: 5 }; services.push(saved); return send(201, saved);
      }
      if (endpoint === "/api/hoa-don/phan-trang") return send(200, paged(isA ? bills : [], url));
      if (endpoint === "/api/hoa-don" && method === "GET") return send(200, isA ? bills : []);
      if (endpoint === "/api/hoa-don" && method === "POST") {
        const saved = { ...bills[0], ...data, id: 13, chiTietHoaDons: [], daThanhToan: "0" };
        bills.push(saved); recalc(saved); return send(201, saved);
      }
      const billMatch = endpoint.match(/^\/api\/hoa-don\/(\d+)$/);
      if (billMatch && method === "GET") {
        const bill = isA && bills.find((row) => String(row.id) === billMatch[1]);
        return send(bill ? 200 : 404, bill || { message: "Không tìm thấy" });
      }
      if (endpoint === "/api/hoa-don/12/chi-tiet" && method === "POST") {
        const line = { id: 22, hoaDonId: 12, dichVuId: 3, tenDichVu: "Phụ phí", donViTinh: "lần",
          tinhTheoChiSo: false, chiSoCu: null, chiSoMoi: null, soLuong: data.soLuong, donGia: "4", thanhTien: "1" };
        bills[0].chiTietHoaDons.push(line); recalc(bills[0]); return send(201, line);
      }
      if (endpoint === "/api/thanh-toan/phan-trang") return send(200, paged(isA ? receipts : [], url));
      if (endpoint === "/api/thanh-toan" && method === "POST") {
        const saved = { ...data, id: 40, ngayThanhToan: data.ngayThanhToan || "2026-10-01T09:00:00",
          kyThanhToan: "2026-10-01", soPhong: "P101", tenNhaTro: "Nhà A" };
        receipts.push(saved); recalc(bills[0]); return send(201, saved);
      }
      if (endpoint === "/api/thanh-toan/40" && method === "PUT") {
        Object.assign(receipts[0], data, { ngayThanhToan: receipts[0].ngayThanhToan });
        recalc(bills[0]); return send(200, receipts[0]);
      }
      unexpected.push(method + " " + endpoint); return send(501, { message: "Unmocked endpoint" });
    });
    const nav = (name) => page.getByRole("navigation", { name: "Quản lý" }).getByRole("link", { name, exact: true });
    async function login(email) {
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Mật khẩu", { exact: true }).fill("Development-test-2026!");
      await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    }
    await page.goto(base + "/hoa-don?hopDongId=7");
    await page.waitForURL("**/tai-khoan");
    await login(ownerA.email);
    await page.waitForURL("**/hoa-don?hopDongId=7");
    await page.getByRole("heading", { name: "Quản lý hóa đơn" }).waitFor();
    await nav("Hợp đồng").click();
    await page.getByRole("heading", { name: "Quản lý hợp đồng" }).waitFor();
    await page.getByText(money("9007199254740993"), { exact: true }).first().waitFor();
    await page.locator("tbody tr").first().getByRole("button", { name: "Hóa đơn", exact: true }).click();
    await page.waitForURL("**/hoa-don?hopDongId=7");
    await page.getByRole("button", { name: "Thêm hóa đơn", exact: true }).click();
    assert.equal(await page.locator('select[name="hopDongId"]').inputValue(), "7");
    await page.locator('input[name="kyThanhToan"]').fill("2026-09");
    await page.locator('input[name="ngayLap"]').fill("2026-10-01");
    await page.locator('input[name="hanThanhToan"]').fill("2026-10-10");
    await page.locator('input[name="tienPhong"]').fill("100");
    await page.getByRole("button", { name: "Lưu", exact: true }).click();
    await page.getByText("Đã lưu hóa đơn.", { exact: true }).waitFor();
    const invoiceRow = () => page.locator("tbody tr").filter({ has: page.locator("td").first().filter({ hasText: /^12$/ }) });
    await invoiceRow().getByRole("button", { name: "Chi tiết / Dịch vụ", exact: true }).click();
    await page.getByRole("button", { name: "Thêm dịch vụ", exact: true }).click();
    await page.getByLabel("Dịch vụ", { exact: true }).selectOption("3");
    await page.getByLabel("Số lượng", { exact: true }).fill("0.125");
    await page.getByRole("button", { name: "Lưu", exact: true }).click();
    await page.getByText("Đã lưu dòng dịch vụ.", { exact: true }).waitFor();
    await invoiceRow().getByRole("button", { name: "Thu tiền / Lịch sử", exact: true }).click();
    await page.waitForURL("**/thanh-toan?hoaDonId=12");
    await page.getByRole("heading", { name: /Hóa đơn #12/ }).waitFor();
    await page.getByRole("button", { name: "Ghi nhận khoản thu", exact: true }).click();
    assert.equal(await page.getByLabel("Hóa đơn", { exact: true }).inputValue(), "12");
    await page.getByLabel("Số tiền (đồng)", { exact: true }).fill("40");
    await page.getByRole("button", { name: "Lưu", exact: true }).click();
    await page.getByText("Đã lưu khoản thu.", { exact: true }).waitFor();
    assert.equal(requests.find((r) => r.endpoint === "/api/thanh-toan" && r.method === "POST").data.soTien, "40");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/thanh-toan/phan-trang") && res.url().includes("size=20")),
      page.getByLabel("Số bản ghi mỗi trang").selectOption("20"),
    ]);
    await page.getByRole("link", { name: "Xem hóa đơn và dịch vụ" }).click();
    await page.getByText("Hóa đơn đã có khoản thu hoặc đã thanh toán; chỉ xem chi tiết.", { exact: true }).waitFor();
    assert.equal(await invoiceRow().getByRole("button", { name: "Xóa", exact: true }).isDisabled(), true);
    await invoiceRow().getByRole("button", { name: "Thu tiền / Lịch sử", exact: true }).click();
    await page.locator("tbody tr").first().getByRole("button", { name: "Sửa", exact: true }).click();
    await page.getByLabel("Số tiền (đồng)", { exact: true }).fill("20");
    await page.getByRole("button", { name: "Lưu", exact: true }).click();
    await page.getByText("Đã lưu khoản thu.", { exact: true }).waitFor();
    await nav("Dịch vụ").click();
    await page.getByRole("button", { name: /Thêm dịch vụ/ }).click();
    await page.locator('input[name="tenDichVu"]').fill("Giá lớn");
    await page.locator('input[name="donViTinh"]').fill("lần");
    await page.locator('input[name="donGiaHienTai"]').fill("9007199254740993");
    await page.getByRole("button", { name: /Lưu/ }).click();
    await page.getByText(money("9007199254740993"), { exact: true }).waitFor();
    assert.equal(requests.find((r) => r.endpoint === "/api/dich-vu" && r.method === "POST").data.donGiaHienTai, "9007199254740993");
    await nav("Dashboard").click();
    await page.getByRole("heading", { name: "Dashboard", exact: true }).waitFor();
    await page.getByText(money("20"), { exact: true }).waitFor();
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/dashboard") && res.url().includes("thang=2026-09")),
      page.locator('input[type="month"]').fill("2026-09"),
    ]);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await page.waitForURL("**/tai-khoan");
    await login(ownerB.email);
    await page.waitForURL("**/dashboard");
    await page.getByRole("link", { name: "Chủ B · Chủ trọ", exact: true }).waitFor();
    await nav("Hợp đồng").click();
    await page.getByText("Không có hợp đồng", { exact: true }).waitFor();
    assert.equal(await page.getByText("Nhà A").count(), 0);
    expired = true;
    await nav("Phòng").click();
    await page.waitForURL("**/tai-khoan");
    assert.equal(await page.getByRole("navigation", { name: "Quản lý" }).count(), 0);
    await login(seeker.email);
    await page.getByText(/Tài khoản người thuê đã đăng nhập/).waitFor();
    const before = requests.length;
    await page.goto(base + "/hoa-don");
    await page.waitForURL("**/tai-khoan");
    assert.equal(requests.slice(before).filter((r) => !r.endpoint.startsWith("/api/auth/")).length, 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    console.log("PASS UI mock: login return URL; contract→invoice→lines→receipts; edit/balance; pagination; big money; monthly Dashboard; mobile; logout/account switch; 401; tenant guard; CSRF; no page errors");
  } catch (error) {
    console.error("URL:", debugPage?.url(), "Page errors:", debugErrors, "Requests:", debugRequests?.map((r) => r.method + " " + r.endpoint));
    if (debugPage) console.error("Page text:", (await debugPage.locator("body").innerText()).slice(0,2500));
    throw error;
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exit(1); });
