let data = JSON.parse(localStorage.getItem("data") || "[]");

let settings = JSON.parse(localStorage.getItem("settings") || JSON.stringify({
  categories:["식비","교통","쇼핑"],
  methods:["현금","카드"]
}));

let step = 0;
let temp = {};
let chart;

/* SAVE */
function save(){
  localStorage.setItem("data",JSON.stringify(data));
}

function saveSettings(){
  localStorage.setItem("settings",JSON.stringify(settings));
}

/* HOME */
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
        <small>${d.category||""} / ${d.method||""}</small><br>
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

/* CALENDAR */
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

/* STATS */
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
      }
    });

  },100);
}

/* SETTINGS */
function renderSet(){

  view.innerHTML=`
    <div class="card">

      <b>카테고리</b>
      ${settings.categories.map((c,i)=>`
        <div>${c} <button onclick="delCat(${i})">삭제</button></div>
      `).join("")}

      <input id="newCat" placeholder="추가">
      <button onclick="addCat()">추가</button>

      <hr>

      <b>지출 방식</b>
      ${settings.methods.map((m,i)=>`
        <div>${m} <button onclick="delMethod(${i})">삭제</button></div>
      `).join("")}

      <input id="newMethod" placeholder="추가">
      <button onclick="addMethod()">추가</button>

      <hr>

      <button onclick="exportData()">백업</button><br><br>
      <input type="file" onchange="importData(event)">

    </div>
  `;
}

/* SETTINGS ACTION */
function addCat(){
  if(newCat.value){
    settings.categories.push(newCat.value);
    saveSettings();
    renderSet();
  }
}

function delCat(i){
  settings.categories.splice(i,1);
  saveSettings();
  renderSet();
}

function addMethod(){
  if(newMethod.value){
    settings.methods.push(newMethod.value);
    saveSettings();
    renderSet();
  }
}

function delMethod(i){
  settings.methods.splice(i,1);
  saveSettings();
  renderSet();
}

/* TAB */
function tab(name){

  document.querySelectorAll(".tabs button")
    .forEach(b=>b.classList.remove("active"));

  event.target.classList.add("active");

  if(name==="home") renderHome();
  if(name==="stats") renderStats();
  if(name==="set") renderSet();
}

/* INPUT FLOW (APP STYLE) */
function openPopup(){
  step=1;
  temp={};
  renderPopup();
  popup.style.display="block";
}

function renderPopup(){

  if(step===1){
    popup.innerHTML=`
      <input type="number" id="tAmount" placeholder="금액">
      <button onclick="step1()">다음</button>
    `;
  }

  if(step===2){
    popup.innerHTML=`
      <button onclick="setType('수입')">수입</button>
      <button onclick="setType('지출')">지출</button>
    `;
  }

  if(step===3){
    popup.innerHTML=`
      <select id="tCat">
        ${settings.categories.map(c=>`<option>${c}</option>`).join("")}
      </select>
      <button onclick="step3()">다음</button>
    `;
  }

  if(step===4){
    popup.innerHTML=`
      <select id="tMethod">
        ${settings.methods.map(m=>`<option>${m}</option>`).join("")}
      </select>
      <button onclick="saveData()">저장</button>
    `;
  }
}

function step1(){
  let v=tAmount.value;
  if(!v) return alert("금액 입력");
  temp.amount=Number(v);
  step=2;
  renderPopup();
}

function setType(t){
  temp.type=t;
  step=3;
  renderPopup();
}

function step3(){
  temp.category=tCat.value;
  step=4;
  renderPopup();
}

function saveData(){

  temp.method=tMethod.value;
  temp.date=new Date().toISOString().split("T")[0];

  data.push(temp);

  save();
  popup.style.display="none";
  renderHome();
}

/* BACKUP */
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
