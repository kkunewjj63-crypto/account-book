let data = JSON.parse(localStorage.getItem("data") || "[]");

let settings = JSON.parse(localStorage.getItem("settings") || JSON.stringify({
  categories:[
    {name:"식비", color:"#ff3b30"},
    {name:"교통", color:"#007aff"},
    {name:"쇼핑", color:"#34c759"}
  ],
  methods:["현금","카드"]
}));

if(typeof settings.categories[0] === "string"){
  settings.categories = settings.categories.map(c=>({name:c,color:"#007aff"}));
}

let step=0,temp={},chart,compareChart,trendChart,methodChart;

/* 저장 */
function save(){ localStorage.setItem("data",JSON.stringify(data)); }
function saveSettings(){ localStorage.setItem("settings",JSON.stringify(settings)); }

/* 홈 */
function renderHome(){

let inS=0,outS=0,list="";

data.slice().reverse().forEach((d,i)=>{
let a=Number(d.amount)||0;
if(d.type==="수입") inS+=a; else outS+=a;

list+=`
<div class="item">
<b>${d.date}</b><br>
<span style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
${d.type} ${a.toLocaleString()}
</span><br>
<small>${d.category} / ${d.method}</small><br>
<button onclick="editData(${data.length-1-i})">수정</button>
<button onclick="deleteData(${data.length-1-i})">삭제</button>
</div>`;
});

income.innerText=inS.toLocaleString();
expense.innerText=outS.toLocaleString();

view.innerHTML=`<div class="card">${list||"데이터 없음"}</div>`;
}

/* 삭제/수정 */
function deleteData(i){
if(confirm("삭제할까?")){
data.splice(i,1); save(); renderHome();
}
}

function editData(i){
temp={...data[i],index:i};
step=1;
renderPopup();
popup.style.display="block";
}

/* 통계 */
function renderStats(){

view.innerHTML=`
<div class="card">
<input type="month" id="monthFilter">
<input type="date" id="startDate">
<input type="date" id="endDate">
<button onclick="applyFilter()">적용</button>
</div>

<div class="card"><canvas id="compareChart"></canvas></div>
<div class="card"><canvas id="trendChart"></canvas></div>
<div class="card"><canvas id="chart"></canvas></div>
<div class="card"><canvas id="methodChart"></canvas></div>
`;

setTimeout(()=>applyFilter(),100);
}

function applyFilter(){

let m=monthFilter.value,s=startDate.value,e=endDate.value;

let filtered=data.filter(d=>{
if(m && !d.date.startsWith(m)) return false;
if(s && d.date<s) return false;
if(e && d.date>e) return false;
return true;
});

drawChart(filtered);
drawCompareChart(filtered);
drawTrendChart(filtered);
drawMethodChart(filtered);
}

/* 그래프들 */
function drawChart(list){

let map={};
list.forEach(d=>{
if(d.type==="지출"){
let k=d.category||"기타";
map[k]=(map[k]||0)+Number(d.amount||0);
}
});

let labels=Object.keys(map);
let colors=labels.map(l=>{
let c=settings.categories.find(x=>x.name===l);
return c?c.color:"#ccc";
});

if(chart) chart.destroy();

chart=new Chart(chartCtx("chart"),{
type:"doughnut",
data:{labels,datasets:[{data:Object.values(map),backgroundColor:colors}]}
});
}

function drawCompareChart(list){

let income=0,expense=0;
list.forEach(d=>{
let a=Number(d.amount)||0;
if(d.type==="수입") income+=a; else expense+=a;
});

if(compareChart) compareChart.destroy();

compareChart=new Chart(chartCtx("compareChart"),{
type:"bar",
data:{labels:["수입","지출"],
datasets:[{data:[income,expense],backgroundColor:["#007aff","#ff3b30"]}]},
options:{plugins:{legend:{display:false}}}
});
}

function drawTrendChart(list){

let inArr=Array(12).fill(0),outArr=Array(12).fill(0);

list.forEach(d=>{
let m=new Date(d.date).getMonth();
let a=Number(d.amount)||0;
if(d.type==="수입") inArr[m]+=a; else outArr[m]+=a;
});

if(trendChart) trendChart.destroy();

trendChart=new Chart(chartCtx("trendChart"),{
type:"line",
data:{
labels:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
datasets:[
{label:"수입",data:inArr,borderColor:"#007aff"},
{label:"지출",data:outArr,borderColor:"#ff3b30"}
]}
});
}

function drawMethodChart(list){

let map={};
list.forEach(d=>{
let m=d.method||"기타";
map[m]=(map[m]||0)+Number(d.amount||0);
});

if(methodChart) methodChart.destroy();

methodChart=new Chart(chartCtx("methodChart"),{
type:"pie",
data:{
labels:Object.keys(map),
datasets:[{data:Object.values(map)}]
}
});
}

function chartCtx(id){ return document.getElementById(id); }

/* 설정 */
function renderSet(){
view.innerHTML=`
<div class="card">
<b>카테고리</b>
${settings.categories.map((c,i)=>`
<div style="display:flex;gap:6px;">
<input value="${c.name}" onblur="editCat(${i},this.value)">
<input type="color" value="${c.color}" onchange="editCatColor(${i},this.value)">
<button onclick="delCat(${i})">삭제</button>
</div>`).join("")}
<input id="newCat">
<button onclick="addCat()">추가</button>

<hr>

<b>지출방식</b>
${settings.methods.map((m,i)=>`
<div style="display:flex;gap:6px;">
<input value="${m}" onblur="editMethod(${i},this.value)">
<button onclick="delMethod(${i})">삭제</button>
</div>`).join("")}
<input id="newMethod">
<button onclick="addMethod()">추가</button>
</div>`;
}

function addCat(){
settings.categories.push({name:newCat.value,color:"#007aff"});
saveSettings(); renderSet();
}

function editCat(i,val){
let old=settings.categories[i].name;
data.forEach(d=>{if(d.category===old)d.category=val;});
settings.categories[i].name=val;
save(); saveSettings(); renderSet();
}

function editCatColor(i,c){
settings.categories[i].color=c;
saveSettings();
}

function delCat(i){
settings.categories.splice(i,1);
saveSettings(); renderSet();
}

function addMethod(){
settings.methods.push(newMethod.value);
saveSettings(); renderSet();
}

function editMethod(i,v){
settings.methods[i]=v;
saveSettings();
}

function delMethod(i){
settings.methods.splice(i,1);
saveSettings(); renderSet();
}

/* 탭 */
function tab(name,el){
document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
el.classList.add("active");
if(name==="home") renderHome();
if(name==="stats") renderStats();
if(name==="set") renderSet();
}

/* 입력 */
function openPopup(){
step=1; temp={};
renderPopup();
popup.style.display="block";
}

function renderPopup(){

if(step===1){
popup.innerHTML=`
<input type="date" id="tDate" value="${new Date().toISOString().split('T')[0]}">
<input type="number" id="tAmount" placeholder="금액">
<button onclick="step1()">다음</button>`;
}

if(step===2){
popup.innerHTML=`
<button onclick="setType('수입')">수입</button>
<button onclick="setType('지출')">지출</button>`;
}

if(step===3){
popup.innerHTML=`
<select id="tCat">
${settings.categories.map(c=>`<option>${c.name}</option>`).join("")}
</select>
<button onclick="step3()">다음</button>`;
}

if(step===4){
popup.innerHTML=`
<select id="tMethod">
${settings.methods.map(m=>`<option>${m}</option>`).join("")}
</select>
<button onclick="saveData()">저장</button>`;
}
}

function step1(){
if(!tAmount.value) return alert("금액 입력");
temp.amount=Number(tAmount.value);
temp.date=tDate.value;
step=2; renderPopup();
}

function setType(t){ temp.type=t; step=3; renderPopup(); }
function step3(){ temp.category=tCat.value; step=4; renderPopup(); }

function saveData(){
temp.method=tMethod.value;
if(temp.index!==undefined) data[temp.index]=temp;
else data.push(temp);
save();
popup.style.display="none";
renderHome();
}

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./service-worker.js");
}
/* INIT */
renderHome();
