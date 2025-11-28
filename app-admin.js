// ================================
// Admin App (Frontend)
// ================================

// ⚠️ 본인의 Worker URL로 교체하세요
const WORKER_URL = "https://lototo-454.pages.dev";

// --------------------------------
// 관리자 로그인
// --------------------------------
async function adminLogin() {
  const code = document.getElementById("admin-code").value;

  const res = await fetch(`${WORKER_URL}/auth/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  }).then(r => r.json());

  if (!res.ok) {
    alert("관리자 코드가 올바르지 않습니다.");
    return;
  }

  hide("admin-auth");
  show("admin-view");

  loadAlgorithms();
}

// --------------------------------
// 알고리즘 목록 로드 (prod)
// --------------------------------
async function loadAlgorithms() {
  const list = await fetch(`${WORKER_URL}/algorithms`)
    .then(r => r.json());

  document.getElementById("algo-json").value = JSON.stringify(list, null, 2);
}

// --------------------------------
// 알고리즘 테스트
// - 관리자 입력 JSON 기반으로 seed 예시로 테스트 실행
// --------------------------------
async function testAlgo() {
  const jsonText = document.getElementById("algo-json").value;

  let json;
  try {
    json = JSON.parse(jsonText);
  } catch (e) {
    alert("JSON 형식 오류입니다. 올바른 JSON을 입력하세요.");
    return;
  }

  const res = await fetch(`${WORKER_URL}/algorithms/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  }).then(r => r.json());

  document.getElementById("test-result").textContent =
    JSON.stringify(res, null, 2);
}

// --------------------------------
// 알고리즘 적용 (prod 덮어쓰기)
// --------------------------------
async function applyAlgo() {
  const jsonText = document.getElementById("algo-json").value;

  let json;
  try {
    json = JSON.parse(jsonText);
  } catch (e) {
    alert("JSON 형식 오류입니다.");
    return;
  }

  const res = await fetch(`${WORKER_URL}/algorithms/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  }).then(r => r.json());

  alert(res.message || "적용 완료");
}
