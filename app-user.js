// ================================
// User App (Frontend)
// ================================

// ⚠️ 반드시 본인 Worker URL로 교체하세요
const WORKER_URL = "https://lucky-voice-10d3.loto09090909.workers.dev";

// --------------------------------
// 페이지 로드 시 인증 유지 체크
// --------------------------------
window.onload = () => {
  if (sessionStorage.getItem("user-auth") === "yes") {
    showMain();
  }
};

// --------------------------------
// 사용자 로그인
// --------------------------------
async function userLogin() {
  const code = document.getElementById("auth-input").value;

  const res = await fetch(`${WORKER_URL}/auth/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  }).then(r => r.json());

  if (res.ok) {
    sessionStorage.setItem("user-auth", "yes");
    showMain();
  } else {
    alert("보안코드가 올바르지 않습니다.");
  }
}

// --------------------------------
// 메인 화면 보이기
// --------------------------------
function showMain() {
  hide("auth-view");
  loadSaturdays();
  show("main-view");
}

// --------------------------------
//  오늘 ~ +31일 사이의 '토요일' 날짜만 불러오기
// --------------------------------
function loadSaturdays() {
  const sel = document.getElementById("date-select");
  sel.innerHTML = "";

  const today = new Date();
  for (let i = 0; i <= 31; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    if (d.getDay() === 6) {
      const opt = document.createElement("option");
      opt.value = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      opt.textContent = `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (토)`;
      sel.appendChild(opt);
    }
  }
}

// --------------------------------
// 번호 생성 시작 (랜덤 30~120초 로딩)
// --------------------------------
function beginGenerate() {
  hide("main-view");
  show("loading-view");

  const delay = Math.floor(Math.random() * 90000) + 30000; // 30~120초
  setTimeout(generateNumbers, delay);
}

// --------------------------------
// 실제 번호 생성
// 1) 음력 변환
// 2) 알고리즘 목록 조회
// 3) seed 전달하여 각 알고리즘 실행
// --------------------------------
async function generateNumbers() {
  const date = document.getElementById("date-select").value;
  const [y, m, d] = date.split("-").map(Number);

  // 1) 음력 변환 호출
  const lunar = await fetch(`${WORKER_URL}/lunar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year: y, month: m, day: d })
  }).then(r => r.json());

  const seed = {
    solar: { y, m, d },
    lunar: lunar.lunar
  };

  // 2) 알고리즘 목록 조회
  const algolist = await fetch(`${WORKER_URL}/algorithms`)
    .then(r => r.json());

  const resultBox = document.getElementById("result-box");
  resultBox.innerHTML = "";

  // 3) 각 알고리즘 실행 (코드 해석)
  algolist.forEach(algo => {
    const fn = new Function("seed", algo.code);
    const nums = fn(seed);

    const div = document.createElement("div");
    div.innerHTML = `<b>${algo.name}</b><br>${nums.join(", ")}`;
    resultBox.appendChild(div);
  });

  hide("loading-view");
  show("result-view");
}

// --------------------------------
// 메인으로 돌아가기
// --------------------------------
function goHome() {
  hide("result-view");
  show("main-view");
}
