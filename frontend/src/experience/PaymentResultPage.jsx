import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ArrowRight, Receipt, ShieldCheck } from "lucide-react";
import { money } from "./data";
import { useAppData } from "./context";

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const { reload } = useAppData();
  const hasVnpayCode = params.get("vnp_ResponseCode") != null;

  const [loading, setLoading] = useState(hasVnpayCode);
  const [result, setResult] = useState(() =>
    hasVnpayCode
      ? null
      : {
          success: false,
          message: "Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPAY.",
        },
  );

  useEffect(() => {
    if (!hasVnpayCode) return;

    let mounted = true;
    async function verifyPayment() {
      try {
        const query = params.toString();
        const res = await fetch(`/api/payment/vnpay/verify?${query}`);
        const data = await res.json();
        if (mounted) {
          setResult(data);
          if (data.success && reload) {
            reload();
          }
        }
      } catch (error) {
        if (mounted) {
          setResult({
            success: false,
            message:
              error?.message ||
              "Không thể kết nối đến máy chủ để xác thực kết quả thanh toán.",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    verifyPayment();
    return () => {
      mounted = false;
    };
  }, [hasVnpayCode, params, reload]);

  if (loading) {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #EEF2FF",
              borderTopColor: "#4F46E5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
            Đang xác thực giao dịch VNPAY...
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
            Hệ thống đang đối soát chữ ký điện tử và tự động gạch nợ hóa đơn, xin vui lòng chờ trong giây lát.
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = result?.success;

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", background: "var(--surface-soft, #F8FAFC)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "var(--surface, #FFFFFF)",
          borderRadius: "24px",
          border: "1px solid var(--line, #E2E8F0)",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.07)",
          padding: "36px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: isSuccess ? "#ECFDF5" : "#FEF2F2",
            color: isSuccess ? "#059669" : "#DC2626",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {isSuccess ? <CheckCircle2 size={36} strokeWidth={2.2} /> : <AlertTriangle size={36} strokeWidth={2.2} />}
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>
          {isSuccess ? "Thanh toán VNPAY thành công!" : "Thanh toán chưa hoàn tất"}
        </h1>

        <p style={{ fontSize: "14px", color: isSuccess ? "#059669" : "#64748B", margin: "0 0 24px", lineHeight: 1.5, fontWeight: isSuccess ? 600 : 400 }}>
          {result?.message}
        </p>

        {isSuccess && (
          <div
            style={{
              background: "var(--surface-soft, #F8FAFC)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "28px",
              textAlign: "left",
              border: "1px solid var(--line, #E2E8F0)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line, #E2E8F0)", fontSize: "14px" }}>
              <span style={{ color: "var(--muted)" }}>Mã hóa đơn:</span>
              <strong style={{ color: "var(--ink)" }}>#{result.invoiceId}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line, #E2E8F0)", fontSize: "14px" }}>
              <span style={{ color: "var(--muted)" }}>Số tiền thanh toán:</span>
              <strong style={{ color: "#4F46E5", fontSize: "16px" }}>{money(result.amount)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line, #E2E8F0)", fontSize: "14px" }}>
              <span style={{ color: "var(--muted)" }}>Mã giao dịch VNPAY:</span>
              <strong style={{ color: "var(--ink)", fontFamily: "monospace" }}>{result.transactionNo || "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line, #E2E8F0)", fontSize: "14px" }}>
              <span style={{ color: "var(--muted)" }}>Ngân hàng thanh toán:</span>
              <strong style={{ color: "var(--ink)" }}>{result.bankCode || "VNPAY"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
              <span style={{ color: "var(--muted)" }}>Trạng thái xử lý:</span>
              <span style={{ color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={16} /> Đã tự động gạch nợ
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/tai-khoan/hoa-don"
            className="button"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Receipt size={17} />
            Xem danh sách hóa đơn
          </Link>
          <Link
            to="/"
            className="button button-soft"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            Về trang chủ
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
