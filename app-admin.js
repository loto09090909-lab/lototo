function adminLogin() {
  const code = document.getElementById("admin-code").value;
  
  if (code === "admin1234") { // 테스트용
    hide("admin-auth");
    show("admin-view");
    document.getElementById("algo-json").value = JSON.stringify([
      { name: "테스트 알고리즘1", code: "return [1,2,3,4,5,6]" },
      { name: "테스트 알고리즘2", code: "return [7,8,9,10,11,12]" }
    ], null, 2);
  } else {
    alert("관리자 코드 오류(테스트용)");
  }
}

function testAlgo() {
  const json = document.getElementById("algo-json").value;
  try {
    const list = JSON.parse(json);
    document.getElementById("test-result").textContent = JSON.stringify(list, null, 2);
  } catch (e) {
    alert("JSON 형식 오류");
  }
}

function applyAlgo() {
  alert("Worker 연결 후 적용됩니다. (현재는 UI 테스트용)");
}
