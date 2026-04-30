let users = JSON.parse(localStorage.getItem("users") || JSON.stringify({
personal:{
name:"내 가계부",
data:[],
settings:{
categories:[
{name:"식비",color:"#ff3b30",icon:"🍔"},
{name:"교통",color:"#007aff",icon:"🚗"}
],
methods:[
{name:"현금",subs:["지갑"]},
{name:"카드",subs:["신한"]}
]
}
},
family:{
name:"가족 가계부",
data:[],
settings:{
categories:[
{name:"생활비",color:"#ff9500",icon:"🏠"}
],
methods:[
{name:"카드",subs:["공용카드"]}
]
}
}
}));

let currentUserKey = localStorage.getItem("currentUser") || "personal";
let currentUser = users[currentUserKey];

let data = currentUser.data;
let settings = currentUser.settings;

let step=0,temp={};
let chart,compareChart,trendChart;

/* 저장 */
function save(){
users[currentUserKey].data=data;
localStorage.setItem("users",JSON.stringify(users));
}

/* 유저 전환 */
function switchUser(key){
currentUserKey=key;
currentUser=users[key];
data=currentUser.data;
settings=currentUser.settings;
localStorage.setItem("currentUser",key);
renderHome();
}

/* 홈 */
function renderHome(){

let inS=0,outS=0,list="";

data.slice().reverse().forEach((d,i)=>{
let a=Number(d.amount)||0;
if(d.type==="수입") inS+=a; else outS+=a;

let cat=settings.categories.find(c=>c.name===d.category);
let icon=cat?cat.icon:"❓";

list+=`
<div class="item">
${icon} ${d.date}<br>
<span style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
${d.type} ${a.toLocaleString()}
</span><br>
<small>${d.category} / ${d.method}</small><br>
<button onclick="editData(${data.length-1-i})">수정</button>
<button onclick="deleteData(${data.length-1-i})">삭제</button>
</div>`;
});

income.innerText=inS;
expense.innerText=outS;

view.innerHTML=`
<div class="card">${createCalendar()}</div>
<div class="card">${list||"데이터 없음"}</div>
`;
}

/* 달력 */
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
if(x.type==="수입") inS+=a; else outS+=a;
});

html+=`
<div class="day">
${d}<br>
<span class="in">${inS||""}</span><br>
<span class="out">${outS||""}</span>
</div>`;
}

return html+"</div>";
}

/* 삭제 */
function deleteData(i){
if(confirm("삭제할까?")){
data.splice(i,1); save(); renderHome();
}
}

/* 수정 */
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
<button onclick="applyFilter()">적용</button>
</div>
<div class="card"><canvas id="compareChart"></canvas></div>
<div class="card"><canvas id="trendChart"></canvas></div>
`;
setTimeout(()=>applyFilter(),100);
}

function applyFilter(){
let m=monthFilter.value;

let filtered=data.filter(d=>{
if(m && !d.date.startsWith(m)) return false;
return true;
});

drawCompareChart(filtered);
drawTrendChart(filtered);
}

function drawCompareChart(list){
let income=0,expense=0;

list.forEach(d=>{
let a=Number(d.amount)||0;
if(d.type==="수입") income+=a;
else expense+=a;
});

if(compareChart) compareChart.destroy();

compareChart=new Chart(document.getElementById("compareChart"),{
type:"bar",
data:{
labels:["수입","지출"],
datasets:[{data:[income,expense],backgroundColor:["#007aff","#ff3b30"]}]
}
});
}

function drawTrendChart(list){
let inArr=Array(12).fill(0);
let outArr=Array(12).fill(0);

list.forEach(d=>{
let m=new Date(d.date).getMonth();
let a=Number(d.amount)||0;
if(d.type==="수입") inArr[m]+=a;
else outArr[m]+=a;
});

if(trendChart) trendChart.destroy();

trendChart=new Chart(document.getElementById("trendChart"),{
type:"line",
data:{
labels:["1","2","3","4","5","6","7","8","9","10","11","12"],
datasets:[
{label:"수입",data:inArr,borderColor:"#007aff"},
{label:"지출",data:outArr,borderColor:"#ff3b30"}
]
}
});
}

/* 탭 */
function tab(name,el){
document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
el.classList.add("active");
if(name==="home") renderHome();
if(name==="stats") renderStats();
}

/* 입력 */
function openPopup(){
step=1;
temp={};
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
${settings.methods.map(m=>`<option>${m.name}</option>`).join("")}
</select>
<button onclick="saveData()">저장</button>`;
}
}

function step1(){
if(!tAmount.value) return;
temp.amount=Number(tAmount.value);
temp.date=tDate.value;
step=2;
renderPopup();
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

renderHome();
