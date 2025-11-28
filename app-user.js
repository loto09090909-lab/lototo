// ================================
// User App (Frontend)
// ================================

// ⚠️ 반드시 본인 Worker URL로 교체하세요
const WORKER_URL = "https://lotto-api.loto09090909.workers.dev";

// 번호 중복 제거 정규화 함수 ===========================
function normalize(nums) {
  const used = new Set();
  const fixed = [];

  for (let n of nums) {
    if (n < 1) n = 1;
    if (n > 45) n = 45;

    let val = n;
    let tries = 0;

    while (used.has(val) && tries < 50) {
      if (val >= 45) val--;
      else if (val <= 1) val++;
      else val = (tries % 2 === 0) ? val + 1 : val - 1;
      tries++;
    }

    while (used.has(val)) val = (val % 45) + 1;

    used.add(val);
    fixed.push(val);
  }

  return fixed.sort((a, b) => a - b);
}
// ======================================================

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

// 분석 단계 메시지
const LOADING_MESSAGES = [
  "음력 기반 핵심 시드 생성 중…",
  "양력 → 음력 달력 정보 정밀 변환…",
  "알고리즘 10개 병렬 로딩…",
  "패턴 매칭 엔진 초기화…",
  "과거 데이터 기반 확률 보정…",
  "시드 기반 번호 군집화 계산…",
  "번호 간 상관관계 분석 중…",
  "기초 조합 생성…",
  "중복 여부 및 규칙성 점검…",
  "최종 검증 중…",
  "거의 완료되었습니다…"
];

let countdownTimer = null;
let messageTimer = null;
let remainingSeconds = 0;

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

// 토요일 목록 생성
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

// ==========================
// 🔥 Premium Loading System
// ==========================
function beginGenerate() {
  hide("main-view");
  show("loading-view");

  remainingSeconds = Math.floor(Math.random() * (120 - 30 + 1)) + 30;
  document.getElementById("loading-count").textContent = remainingSeconds;

  const totalMessages = LOADING_MESSAGES.length;
  let messageIndex = 0;

  const intervalPerMessage = remainingSeconds / totalMessages;

  messageTimer = setInterval(() => {
    const el = document.getElementById("loading-text");
    el.style.opacity = 0;

    setTimeout(() => {
      el.innerText = LOADING_MESSAGES[messageIndex];
      el.style.opacity = 1;
    }, 150);

    messageIndex = Math.min(messageIndex + 1, totalMessages - 1);
  }, intervalPerMessage * 1000);

  countdownTimer = setInterval(() => {
    remainingSeconds -= 1;

    const counterEl = document.getElementById("loading-count");

    if (remainingSeconds <= 10) {
      counterEl.style.color = "#d63f3f";
    }

    counterEl.textContent = remainingSeconds;

    if (remainingSeconds <= 0) {
      clearInterval(countdownTimer);
      clearInterval(messageTimer);
      generateNumbers();
    }
  }, 1000);
}


// ==========================
// 🔥 핵심 번호 생성 함수
// ==========================
async function generateNumbers() {
  const date = document.getElementById("date-select").value;
  const [y, m, d] = date.split("-").map(Number);

  // ===== 1) 음력 API 호출 =====
  const lunar = await fetch(`${WORKER_URL}/lunar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year: y, month: m, day: d })
  }).then(r => r.json());

  // ===== 2) 날짜/음력/seed 출력 =====
  const solarMonth = m;
  const solarDay = d;

  const lunarMonth = lunar.lunar.m;
  const lunarDay = lunar.lunar.d;

  const seedString = `${solarMonth}, ${solarDay}, ${lunarMonth}, ${lunarDay}`;

  document.getElementById("date-info").innerHTML = `
    선택 날짜: ${solarMonth}월 ${solarDay}일 (음 ${lunarMonth}월 ${lunarDay}일)<br>
    기준 값: ${seedString}
  `;

  const seed = {
    solar: { y, m: solarMonth, d: solarDay },
    lunar: { y, m: lunarMonth, d: lunarDay }
  };

  // ===== 3) 알고리즘 호출 + normalize =====
  const algolist = await fetch(`${WORKER_URL}/algorithms`)
    .then(r => r.json());

  const box = document.getElementById("result-box");
  box.innerHTML = "";

  algolist.forEach(algo => {
    try {
      const fn = new Function("seed", "normalize", algo.code);
      const nums = fn(seed, normalize);  // ← normalize 전달
      const div = document.createElement("div");
      div.innerHTML = `<b>${algo.name}</b><br>${nums.join(", ")}`;
      box.appendChild(div);

    } catch (err) {
      const div = document.createElement("div");
      div.innerHTML = `<b>${algo.name}</b><br>ERROR: ${err}`;
      box.appendChild(div);
    }
  });

  // ===== 4) 결과 화면으로 이동 =====
  hide("loading-view");
  show("result-view");
}


// ==========================
// 다시 선택하기 버튼
// ==========================
function goHome() {
  hide("result-view");
  show("main-view");
}
