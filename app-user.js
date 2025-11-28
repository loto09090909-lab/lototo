// ================================
// User App (Frontend)
// ================================

// ⚠️ 반드시 본인 Worker URL로 교체하세요
const WORKER_URL = "https://lucky-voice-10d3.loto09090909.workers.dev";

// ENTER KEY SUPPORT
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("auth-input");
  if (input) {
    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") userLogin();
    });
  }

  if (sessionStorage.getItem("user-auth") === "yes") showMain();
});

async function userLogin() {
  const code = document.getElementById("auth-input").value;
  const res = await fetch(`${WORKER_URL}/auth/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  }).then(r => r.json()).catch(() => ({ ok: false }));

  if (!res.ok) return alert("보안코드가 올바르지 않습니다.");
  sessionStorage.setItem("user-auth", "yes");
  showMain();
}

function showMain() {
  hide("auth-view");
  loadSaturdays();
  show("main-view");
}

// 날짜 계산
function loadSaturdays() {
  const s = document.getElementById("date-select");
  s.innerHTML = "";
  const today = new Date();
  for (let i = 0; i <= 31; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    if (d.getDay() === 6) {
      const opt = document.createElement("option");
      opt.value = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      opt.textContent = `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (토)`;
      s.appendChild(opt);
    }
  }
}

// ========== 카운트다운 기능 추가 ==========

let countdownTimer = null;
let remainingSeconds = 0;

function beginGenerate() {
  hide("main-view");
  show("loading-view");

  // 30초 ~ 120초 사이 랜덤 선택
  remainingSeconds = Math.floor(Math.random() * (120 - 30 + 1)) + 30;

  // 첫 렌더링
  document.getElementById("loading-count").textContent = remainingSeconds;

  // 카운트다운 시작
  countdownTimer = setInterval(() => {
    remainingSeconds -= 1;
    document.getElementById("loading-count").textContent = remainingSeconds;

    if (remainingSeconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      generateNumbers();
    }
  }, 1000);
}


// 번호 생성
function beginGenerate() {
  hide("main-view");
  show("loading-view");
  const delay = Math.floor(Math.random() * 90000) + 30000;
  setTimeout(generateNumbers, delay);
}

// Worker 호출
async function generateNumbers() {
  const date = document.getElementById("date-select").value;
  const [y, m, d] = date.split("-").map(Number);

  const lunar = await fetch(`${WORKER_URL}/lunar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year: y, month: m, day: d })
  }).then(r => r.json());

  const seed = { solar: { y, m, d }, lunar: lunar.lunar };
  const algolist = await fetch(`${WORKER_URL}/algorithms`).then(r => r.json());

  const box = document.getElementById("result-box");
  box.innerHTML = "";

  algolist.forEach(algo => {
    const fn = new Function("seed", algo.code);
    const nums = fn(seed);

    const div = document.createElement("div");
    div.innerHTML = `<b>${algo.name}</b><br>${nums.join(", ")}`;
    box.appendChild(div);
  });

  hide("loading-view");
  show("result-view");
}
