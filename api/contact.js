const { Resend } = require("resend");

const SERVICES = new Set([
  "줄눈시공",
  "입주청소",
  "탄성코트",
  "세라믹코팅",
  "단열필름",
  "인테리어필름",
  "기타",
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100 * 1024) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || "dawoon4209@gmail.com";
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "더탑클래스홈케어 <onboarding@resend.dev>";

  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: "이메일 발송 설정이 완료되지 않았습니다. (RESEND_API_KEY)",
    });
  }

  try {
    const body = await readJsonBody(req);

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();
    const privacy = Boolean(body.privacy);

    if (!name || !phone || !message) {
      return res.status(400).json({ ok: false, error: "필수 항목을 모두 입력해 주세요." });
    }

    if (!privacy) {
      return res.status(400).json({
        ok: false,
        error: "개인정보 수집·이용에 동의해 주세요.",
      });
    }

    if (service && !SERVICES.has(service)) {
      return res.status(400).json({ ok: false, error: "희망 서비스를 다시 선택해 주세요." });
    }

    if (phone.replace(/\D/g, "").length < 9) {
      return res.status(400).json({ ok: false, error: "연락처 형식을 확인해 주세요." });
    }

    const resend = new Resend(apiKey);
    const serviceLabel = service || "미선택";

    const html = `
      <h2>홈페이지 문의</h2>
      <p><strong>이름</strong><br>${escapeHtml(name)}</p>
      <p><strong>연락처</strong><br>${escapeHtml(phone)}</p>
      <p><strong>희망 서비스</strong><br>${escapeHtml(serviceLabel)}</p>
      <p><strong>문의내용</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    const text = [
      "홈페이지 문의",
      "",
      `이름: ${name}`,
      `연락처: ${phone}`,
      `희망 서비스: ${serviceLabel}`,
      "",
      message,
    ].join("\n");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `[홈페이지 문의] ${name}${service ? ` · ${service}` : ""}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({
        ok: false,
        error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);

    if (err.message === "PAYLOAD_TOO_LARGE") {
      return res.status(413).json({ ok: false, error: "요청 크기가 너무 큽니다." });
    }

    return res.status(500).json({
      ok: false,
      error: "문의 전송 중 오류가 발생했습니다.",
    });
  }
};
