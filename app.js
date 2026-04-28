let data = JSON.parse(localStorage.getItem("data") || "[]");

/* ===== SAVE ===== */
function save(){
  localStorage.setItem("data", JSON.stringify(data));
}

/* ===== HOME ===== */
function renderHome(){

  let inS=0,outS=0;

  let cal = createCalendar();

  let list="";

  data.slice().reverse().forEach(d=>{

    let a=Number(d.amount)||0;

    if(d.type==="수입") inS+=a;
    else outS+=a;

    list+=`
      <div class="item">
        <b>${d.date}</b><br>
        <span style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
          ${d.type} ${a.toLocaleString()}
        </span><br>
        <small>${d.category||""} / ${d.method||""}</small><br>
        <small>${d.memo||""}</small>
      </div>
    `;
  });

  income.innerText=inS.toLocaleString();
  expense.innerText=outS.toLocaleString();

  view.innerHTML=`
    <div class="card">${cal}</div>
    <div class="card">${list||"데이터 없음"}</div>
  `;
}

/* ===== CALENDAR ===== */
function createCalendar(){

  let now=new Date();
  let y=now.getFullYear();
  let m=now.getMonth();

  let first=new Date(y,m,1).getDay();
  let last=new Date(y,m+1,0).getDate();

  let html="<div class='calendar'>";

  for(let i=0;i<first;i++) html+="<div></div>";

  for(let d=1;d<=last;d++){

    let date=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    let inS=0,outS=0;

    data.filter(x=>x.date===date).forEach(x=>{
      let a=Number(x.amount)||0;
      if(x.type==="수입") inS+=a;
      else outS+=a;
    });

    html+=`
      <div class="day">
        ${d}<br>
        <span style="color:#007aff">${inS||""}</span><br>
        <span style="color:#ff3b30">${outS||""}</span>
      </div>
    `;
  }

  html+="</div>";
  return html;
}

/* ===== STATS ===== */
function renderStats(){
  view.innerHTML=`
    <div class="card">
      통계 기능 (기본 안정 버전)
      <br><br>
      총 수입: ${getSum("수입").toLocaleString()}<br>
      총 지출: ${getSum("지출").toLocaleString()}
    </div>
  `;
}

/* ===== SETTINGS ===== */
function renderSet(){
  view.innerHTML=`
    <div class="card">
      <button onclick="exportData()">백업</button><br><br>
      <input type="file" onchange="importData(event)">
    </div>
  `;
}

/* ===== SUM ===== */
function getSum(type){
  return data.filter(d=>d.type===type)
    .reduce((s,d)=>s+(Number(d.amount)||0),0);
}

/* ===== TAB ===== */
function tab(name){

  document.querySelectorAll(".tabs button")
    .forEach(b=>b.classList.remove("active"));

  event.target.classList.add("active");

  if(name==="home") renderHome();
  if(name==="stats") renderStats();
  if(name==="set") renderSet();
}

/* ===== ADD ===== */
function add(){

  if(!amount.value){
    alert("금액 입력");
    return;
  }

  data.push({
    date:date.value||new Date().toISOString().split("T")[0],
    amount:Number(amount.value),
    type:type.value,
    category:category.value||"기타",
    method:method.value||"",
    memo:memo.value||""
  });

  save();
  closePopup();
  renderHome();
}

/* ===== POPUP ===== */
function openPopup(){popup.style.display="block";}
function closePopup(){popup.style.display="none";}

/* ===== BACKUP ===== */
function exportData(){
  let blob=new Blob([JSON.stringify(data)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="backup.json";
  a.click();
}

function importData(e){
  let r=new FileReader();
  r.onload=()=>{
    data=JSON.parse(r.result)||[];
    save();
    renderHome();
  };
  r.readAsText(e.target.files[0]);
}

/* INIT */
renderHome();
