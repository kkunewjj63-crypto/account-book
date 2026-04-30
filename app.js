let users = JSON.parse(localStorage.getItem("users") || JSON.stringify({
personal:{data:[],categories:["식비","교통"],methods:["현금","카드"]},
family:{data:[],categories:["생활비"],methods:["카드"]}
}));

let current = localStorage.getItem("current") || "personal";

function save(){localStorage.setItem("users",JSON.stringify(users));}

function switchUser(u){
current=u;
localStorage.setItem("current",u);
render();
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

html+=`
<div class="day">
${d}<br>
<span class="in">${inS||""}</span><br>
<span class="out">${outS||""}</span>
</div>`;
}

html+="</div>";
return html;
}

/* RENDER */
function render(){
btnP.classList.toggle("active",current==="personal");
btnF.classList.toggle("active",current==="family");

let u=users[current];

let html=createCalendar(u.data);

/* LIST */
let grouped={};
u.data.forEach(d=>{
if(!grouped[d.date]) grouped[d.date]=[];
grouped[d.date].push(d);
});

Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).forEach(date=>{
html+=`<div class="card"><b>${date}</b>`;

grouped[date].forEach((d,i)=>{
html+=`
<div class="item" onclick="editData('${date}',${i})">
<div>${d.category}</div>
<div class="${d.type==='수입'?'in':'out'}">${d.amount}</div>
</div>`;
});

html+="</div>";
});

view.innerHTML=html;
}

/* INPUT */
function openSheet(d=null){
sheet.classList.add("show");

let u=users[current];

sheet.innerHTML=`
<input type="date" id="d" value="${d?.date||''}">
<input type="number" id="a" value="${d?.amount||''}" placeholder="금액">

<select id="type">
<option ${d?.type==='지출'?'selected':''}>지출</option>
<option ${d?.type==='수입'?'selected':''}>수입</option>
</select>

<select id="cat">
${u.categories.map(c=>`<option ${d?.category===c?'selected':''}>${c}</option>`).join("")}
</select>

<select id="method">
${u.methods.map(m=>`<option ${d?.method===m?'selected':''}>${m}</option>`).join("")}
</select>

<button class="primary" onclick="saveData()">저장</button>
<button onclick="closeSheet()">닫기</button>
`;
}

function closeSheet(){sheet.classList.remove("show");}

function saveData(){
users[current].data.push({
date:d.value,
amount:a.value,
type:type.value,
category:cat.value,
method:method.value
});
save(); closeSheet(); render();
}

/* EDIT */
function editData(date,i){
let item=users[current].data.filter(x=>x.date===date)[i];
openSheet(item);
}

/* SETTINGS */
function renderSettings(){
let u=users[current];

view.innerHTML=`
<div class="card">
<h3>카테고리</h3>
${u.categories.map((c,i)=>`
<div class="item">
<input value="${c}" onchange="editCat(${i},this.value)">
<button onclick="delCat(${i})">삭제</button>
</div>`).join("")}

<input id="newCat">
<button onclick="addCat()">추가</button>

<hr>

<h3>지출방식</h3>
${u.methods.map((m,i)=>`
<div class="item">
<input value="${m}" onchange="editMethod(${i},this.value)">
<button onclick="delMethod(${i})">삭제</button>
</div>`).join("")}

<input id="newMethod">
<button onclick="addMethod()">추가</button>

</div>
`;
}

function addCat(){if(newCat.value){users[current].categories.push(newCat.value);save();renderSettings();}}
function editCat(i,v){users[current].categories[i]=v;save();}
function delCat(i){users[current].categories.splice(i,1);save();renderSettings();}

function addMethod(){if(newMethod.value){users[current].methods.push(newMethod.value);save();renderSettings();}}
function editMethod(i,v){users[current].methods[i]=v;save();}
function delMethod(i){users[current].methods.splice(i,1);save();renderSettings();}

render();
