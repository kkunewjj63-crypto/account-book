let users = JSON.parse(localStorage.getItem("users") || JSON.stringify({
personal:{
data:[],
categories:[
{name:"식비",color:"#ff5c8a",icon:"🍔"},
{name:"교통",color:"#007aff",icon:"🚗"}
],
methods:["현금","카드"]
},
family:{data:[],categories:[],methods:["카드"]}
}));

let current = localStorage.getItem("current") || "personal";

function save(){localStorage.setItem("users",JSON.stringify(users));}

function switchUser(u){
current=u;
localStorage.setItem("current",u);
render();
}

function tab(name,el){
document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
el.classList.add("active");

if(name==="home") render();
if(name==="stats") renderStats();
if(name==="set") renderSettings();
}

/* CALENDAR */
function createCalendar(data){
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

html+=`<div class="day">${d}<br>${inS||""}<br>${outS||""}</div>`;
}

html+="</div>";
return html;
}

/* HOME */
function render(){
btnP.classList.toggle("active",current==="personal");
btnF.classList.toggle("active",current==="family");

let u=users[current];
let html=createCalendar(u.data);

u.data.forEach(d=>{
let cat=u.categories.find(c=>c.name===d.category)||{};
html+=`
<div class="card item">
<div>${cat.icon||""} ${d.category}</div>
<div style="color:${cat.color||"#000"}">${d.amount}</div>
</div>`;
});

view.innerHTML=html;
}

/* INPUT */
function openSheet(){
let u=users[current];
sheet.classList.add("show");

sheet.innerHTML=`
<input type="date" id="d">
<input type="number" id="a">

<select id="type">
<option>지출</option>
<option>수입</option>
</select>

<select id="cat">
${u.categories.map(c=>`<option>${c.name}</option>`).join("")}
</select>

<select id="method">
${u.methods.map(m=>`<option>${m}</option>`).join("")}
</select>

<button class="primary" onclick="saveData()">저장</button>
<button onclick="sheet.classList.remove('show')">닫기</button>
`;
}

function saveData(){
users[current].data.push({
date:d.value,
amount:a.value,
type:type.value,
category:cat.value,
method:method.value
});
save();
sheet.classList.remove("show");
render();
}

/* STATS */
function renderStats(){
let u=users[current];

let catMap={};
let methodMap={};

u.data.forEach(d=>{
if(d.type==="지출"){
catMap[d.category]=(catMap[d.category]||0)+Number(d.amount);
methodMap[d.method]=(methodMap[d.method]||0)+Number(d.amount);
}
});

view.innerHTML=`
<div class="card"><canvas id="catChart"></canvas></div>
<div class="card"><canvas id="methodChart"></canvas></div>
`;

setTimeout(()=>{
new Chart(catChart,{
type:"doughnut",
data:{labels:Object.keys(catMap),datasets:[{data:Object.values(catMap)}]}
});

new Chart(methodChart,{
type:"pie",
data:{labels:Object.keys(methodMap),datasets:[{data:Object.values(methodMap)}]}
});
},100);
}

/* SETTINGS */
function renderSettings(){
let u=users[current];

view.innerHTML=`
<div class="card">
<h3>카테고리</h3>
${u.categories.map((c,i)=>`
<div class="item">
<input value="${c.name}" onchange="editCat(${i},this.value)">
<input type="color" value="${c.color}" onchange="editColor(${i},this.value)">
<input value="${c.icon}" onchange="editIcon(${i},this.value)">
<button onclick="delCat(${i})">삭제</button>
</div>
`).join("")}

<button onclick="addCat()">추가</button>

<hr>

<h3>지출방식</h3>
${u.methods.map((m,i)=>`
<div class="item">
<input value="${m}" onchange="editMethod(${i},this.value)">
<button onclick="delMethod(${i})">삭제</button>
</div>
`).join("")}

<button onclick="addMethod()">추가</button>
</div>
`;
}

function addCat(){
users[current].categories.push({name:"새카테고리",color:"#000",icon:"⭐"});
save(); renderSettings();
}

function editCat(i,v){users[current].categories[i].name=v;save();}
function editColor(i,v){users[current].categories[i].color=v;save();}
function editIcon(i,v){users[current].categories[i].icon=v;save();}
function delCat(i){users[current].categories.splice(i,1);save();renderSettings();}

function addMethod(){users[current].methods.push("새방식");save();renderSettings();}
function editMethod(i,v){users[current].methods[i]=v;save();}
function delMethod(i){users[current].methods.splice(i,1);save();renderSettings();}
