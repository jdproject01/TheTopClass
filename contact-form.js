(function () {
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const status = document.getElementById("inquiry-status");
  const privacyConsent = document.getElementById("inquiry-privacy");
  const privacyError = document.getElementById("inquiry-privacy-error");
  const privacyToggle = document.getElementById("inquiry-privacy-toggle");
  const privacyDetail = document.getElementById("inquiry-privacy-detail");

  function showStatus(message, isError) {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle("inquiry-status--error", Boolean(isError));
  }

  function showPrivacyError(show) {
    if (privacyError) privacyError.hidden = !show;
  }

  if (privacyConsent) {
    privacyConsent.addEventListener("change", function () {
      if (privacyConsent.checked) showPrivacyError(false);
    });
  }

  if (privacyToggle && privacyDetail) {
    privacyToggle.addEventListener("click", function () {
      const willOpen = privacyDetail.hidden;
      privacyDetail.hidden = !willOpen;
      privacyToggle.textContent = willOpen ? "내용닫기" : "내용보기";
      privacyToggle.setAttribute("aria-expanded", String(willOpen));
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (privacyConsent && !privacyConsent.checked) {
      showPrivacyError(true);
      privacyConsent.focus();
      return;
    }

    showPrivacyError(false);

    const name = (form.name && form.name.value.trim()) || "";
    const phone = (form.phone && form.phone.value.trim()) || "";
    const service = (form.service && form.service.value.trim()) || "";
    const message = (form.message && form.message.value.trim()) || "";

    if (!name || !phone || !message) {
      showStatus("필수 항목을 모두 입력해 주세요.", true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "전송 중...";
    }
    if (status) status.hidden = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          service: service,
          message: message,
          privacy: true,
        }),
      });

      let result = {};
      try {
        result = await response.json();
      } catch (parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || "문의 전송에 실패했습니다.");
      }

      form.reset();
      if (privacyDetail) {
        privacyDetail.hidden = true;
      }
      if (privacyToggle) {
        privacyToggle.textContent = "내용보기";
        privacyToggle.setAttribute("aria-expanded", "false");
      }
      showStatus("문의가 접수되었습니다. 확인 후 연락드리겠습니다.", false);
    } catch (err) {
      const isLocalFile =
        window.location.protocol === "file:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocalFile && String(err.message || "").includes("Failed to fetch")) {
        showStatus(
          "로컬 미리보기에서는 이메일 API가 동작하지 않습니다. Vercel 배포 주소 또는 npm run dev로 테스트해 주세요.",
          true
        );
      } else {
        showStatus(err.message || "문의 전송 중 오류가 발생했습니다.", true);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "문의 보내기";
      }
    }
  });
})();
