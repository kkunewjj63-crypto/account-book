let data = JSON.parse(localStorage.getItem("data") || "[]");
let chartInstance = null;

/* 저장 */
function save(){
  localStorage.setItem("data", JSON.stringify(data));
}

/* 전체 렌더 */
function render(){
  safeCalc();
  renderList();
  renderCalendar();
  renderChart();
}

/* 안전 합계 */
function safeCalc(){
  let inS = 0;
  let outS = 0;

  data.forEach(d=>{
    let amt = Number(d.amount) || 0;

    if(d.type === "수입") inS += amt;
    else outS += amt;
  });

  income.innerText = inS.toLocaleString();
  expense.innerText = outS.toLocaleString();
}

/* 리스트 */
function renderList(){
  let box = document.getElementById("list");
  if(!box) return;

  box.innerHTML = "";

  data
    .slice()
    .reverse()
    .forEach(d=>{

      let amt = Number(d.amount) || 0;

      let div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <b>${escapeHtml(d.date)}</b><br>
        <span style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
          ${d.type} ${amt.toLocaleString()}
        </span>
        <div class="small">
          ${escapeHtml(d.category || "기타")} / ${escapeHtml(d.method || "")}
        </div>
        <div class="small">${escapeHtml(d.memo || "")}</div>
      `;

      box.appendChild(div);
    });
}

/* 달력 */
function renderCalendar(){
  let cal = document.getElementById("calendar");
  if(!cal) return;

  cal.innerHTML = "";

  let now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth();

  monthTitle.innerText = `${y}년 ${m+1}월`;

  let first = new Date(y,m,1).getDay();
  let last = new Date(y,m+1,0).getDate();

  for(let i=0;i<first;i++){
    cal.appendChild(document.createElement("div"));
  }

  for(let d=1; d<=last; d++){

    let date =
      `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    let dayData = data.filter(x=>x.date===date);

    let inS = 0;
    let outS = 0;

    dayData.forEach(x=>{
      let amt = Number(x.amount) || 0;
      if(x.type === "수입") inS += amt;
      else outS += amt;
    });

    let div = document.createElement("div");
    div.className = "day";

    div.innerHTML = `
      ${d}<br>
      <span class="in">${inS ? inS.toLocaleString() : ""}</span><br>
      <span class="out">${outS ? outS.toLocaleString() : ""}</span>
    `;

    cal.appendChild(div);
  }
}

/* 차트 (완전 안정화) */
function renderChart(){

  let ctx = document.getElementById("chart");
  if(!ctx) return;

  let map = {};

  data.forEach(d=>{
    if(d.type === "지출"){
      let key = d.category || "기타";
      map[key] = (map[key] || 0) + (Number(d.amount) || 0);
    }
  });

  let labels = Object.keys(map);
  let values = Object.values(map);

  if(chartInstance){
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx,{
    type:"pie",
    data:{
      labels,
      datasets:[{
        data:values,
        backgroundColor:[
          "#007aff","#ff3b30","#34c759",
          "#ff9500","#5856d6","#af52de",
          "#5ac8fa","#ffcc00"
        ]
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{
          position:"bottom"
        }
      }
    }
  });
}

/* 추가 (검증 강화) */
function add(){

  let amt = Number(amount.value);

  if(!date.value){
    date.value = new Date().toISOString().split("T")[0];
  }

  if(!amt || amt <= 0){
    alert("금액을 입력하세요");
    return;
  }

  data.push({
    date: date.value,
    amount: amt,
    type: type.value,
    category: category.value || "기타",
    method: method.value || "",
    memo: memo.value || ""
  });

  save();
  closePopup();
  render();
}

/* 안전 HTML */
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

/* 탭 */
function tab(t){

  ["home","cal","stats","set"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
  });

  document.querySelectorAll(".tabs button")
    .forEach(b=>b.classList.remove("active"));

  document.getElementById(t).style.display = "block";

  if(event && event.target){
    event.target.classList.add("active");
  }
}

/* 팝업 */
function openPopup(){ popup.style.display="block"; }
function closePopup(){ popup.style.display="none"; }

/* 백업 */
function exportData(){
  let blob = new Blob([JSON.stringify(data)],{type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "account_backup.json";
  a.click();
}

/* 복원 */
function importData(e){
  let file = e.target.files[0];
  if(!file) return;

  let r = new FileReader();

  r.onload = function(){
    try{
      let parsed = JSON.parse(r.result);
      if(Array.isArray(parsed)){
        data = parsed;
        save();
        render();
      }
    } catch(e){
      alert("복원 실패");
    }
  };

  r.readAsText(file);
}

/* 초기 실행 */
render();