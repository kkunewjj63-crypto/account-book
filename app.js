let data = JSON.parse(localStorage.getItem("data") || "[]");
let chart;

/* ===== SAVE SAFE ===== */
function save(){
  try{
    localStorage.setItem("data", JSON.stringify(data));
  }catch(e){
    alert("저장 오류");
  }
}

/* ===== HOME ===== */
function renderHome(){

  let inS=0,outS=0;

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
        <small>${d.category||"기타"} / ${d.method||""}</small><br>
        <small>${d.memo||""}</small>
      </div>
    `;
  });

  income.innerText=inS.toLocaleString();
  expense.innerText=outS.toLocaleString();

  view.innerHTML=`
    <div class="card">${createCalendar()}</div>
    <div class="card">${list||"데이터 없음"}</div>
  `;
}

/* ===== CALENDAR ENGINE ===== */
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
        <span class="in">${inS||""}</span><br>
        <span class="out">${outS||""}</span>
      </div>
    `;
  }

  html+="</div>";
  return html;
}

/* ===== STATS (PRO LEVEL) ===== */
function renderStats(){

  let map={};

  data.forEach(d=>{
    if(d.type==="지출"){
      let k=d.category||"기타";
      map[k]=(map[k]||0)+(Number(d.amount)||0);
    }
  });

  let labels=Object.keys(map);
  let values=Object.values(map);

  view.innerHTML=`
    <div class="card">
      <canvas id="chart"></canvas>
    </div>
  `;

  setTimeout(()=>{

    let ctx=document.getElementById("chart");

    if(chart) chart.destroy();

    chart=new Chart(ctx,{
      type:"doughnut",
      data:{
        labels:labels.length?labels:["데이터 없음"],
        datasets:[{
          data:values.length?values:[1],
          backgroundColor:[
            "#007aff","#ff3b30","#34c759","#ff9500","#5856d6","#af52de"
          ]
        }]
      },
      options:{
        plugins:{
          legend:{position:"bottom"}
        }
      }
    });

  },100);
}

/* ===== SETTINGS (BACKUP) ===== */
function renderSet(){

  view.innerHTML=`
    <div class="card">
      <b>설정</b><br><br>

      <button onclick="exportData()">데이터 백업</button><br><br>

      <input type="file" onchange="importData(event)">
    </div>
  `;
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
  a.download="account_backup.json";
  a.click();
}

function importData(e){
  let r=new FileReader();
  r.onload=()=>{
    try{
      data=JSON.parse(r.result)||[];
      save();
      renderHome();
    }catch{
      alert("복원 실패");
    }
  };
  r.readAsText(e.target.files[0]);
}

/* INIT */
renderHome();
