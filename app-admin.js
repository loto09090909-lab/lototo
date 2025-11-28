// ================================
// Admin App (Frontend)
// ================================

// ⚠️ 본인의 Worker URL로 교체하세요
const WORKER_URL = "https://lucky-voice-10d3.loto09090909.workers.dev";

// ENTER KEY SUPPORT
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("admin-code");
  if (input) {
    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") adminLogin();
    });
  }
});

async function adminLogin() {
  const code = document.getElementById("admin-code").value;

  const res = await fetch(`${WORKER_URL}/auth/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  }).then(r => r.json()).catch(() => ({ ok:false }));

  if (!res.ok) return alert("관리자 코드가 올바르지 않습니다.");

  hide("admin-auth");
  show("admin-view");
  loadAlgorithms();
}

async function loadAlgorithms() {
  const list = await fetch(`${WORKER_URL}/algorithms`).then(r => r.json());
  document.getElementById("algo-json").value = JSON.stringify(list, null, 2);
}

async function testAlgo() {
  let json;
  try {
    json = JSON.parse(document.getElementById("algo-json").value);
  } catch {
    return alert("JSON 형식 오류입니다.");
  }

  const res = await fetch(`${WORKER_URL}/algorithms/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  }).then(r => r.json());

  document.getElementById("test-result").textContent =
    JSON.stringify(res, null, 2);
}

async function applyAlgo() {
  let json;
  try {
    json = JSON.parse(document.getElementById("algo-json").value);
  } catch {
    return alert("JSON 형식 오류입니다.");
  }

  const res = await fetch(`${WORKER_URL}/algorithms/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  }).then(r => r.json());

  alert(res.message || "적용 완료");
}
