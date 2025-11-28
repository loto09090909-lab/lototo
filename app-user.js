// 아직 Worker URL이 없기 때문에 테스트용 mock 처리
const WORKER_URL = null;

window.onload = () => {
  if (sessionStorage.getItem("user-auth") === "yes") {
    showMain();
  }
};

function userLogin() {
  const code = document.getElementById("auth-input").value;

  if (code === "1234") { // 테스트용
    sessionStorage.setItem("user-auth", "yes");
    showMain();
  } else {
    alert("보안코드 오류(테스트용 기준)");
  }
}

function showMain() {
  hide("auth-view");
  loadSaturdays();
  show("main-view");
}

function loadSaturdays() {
  const sel = document.getElementById("date-select");
  sel.innerHTML = "";

  const today = new Date();
  for (let i = 0; i <= 31; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    if (d.getDay() === 6) {
      const opt = document.createElement("option");
      opt.value = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      opt.textContent = opt.value + " (토)";
      sel.appendChild(opt);
    }
  }
}

function beginGenerate() {
  hide("main-view");
  show("loading-view");

  const delay = Math.floor(Math.random() * 90000) + 30000;
  setTimeout(mockResult, delay);
}

function mockResult() {
  const resultBox = document.getElementById("result-box");
  resultBox.innerHTML = `
    <div><b>알고리즘1</b><br>1, 5, 9, 12, 33, 41</div>
    <div><b>알고리즘2</b><br>7, 14, 19, 22, 30, 44</div>
  `;

  hide("loading-view");
  show("result-view");
}

function goHome() {
  hide("result-view");
  show("main-view");
}
