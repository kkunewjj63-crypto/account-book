let users = JSON.parse(localStorage.getItem("users") || JSON.stringify({
personal:{name:"개인",data:[],categories:["식비","교통"],methods:["현금","카드"]},
family:{name:"가족",data:[],categories:["생활비"],methods:["카드"]}
}));

let current = localStorage.getItem("currentUser") || "personal";

function save(){
localStorage.setItem("users",JSON.stringify(users));
}

function switchUser(key){
current=key;
localStorage.setItem("currentUser",key);
renderHome();
}

function tab(name,el){
document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
el.classList.add("active");

if(name==="home") renderHome();
if(name==="stats") renderStats();
if(name==="set") renderSet();
}

/* HOME */
function renderHome(){
let u=users[current];
let html="";

u.data.slice().reverse().forEach((d,i)=>{
html+=`
<div class="card">
${d.date} / ${d.type} / ${d.amount}<br>
${d.category} / ${d.method}<br>
<button onclick="del(${i})">삭제</button>
</div>`;
});

view.innerHTML=html || "<div class='card'>데이터 없음</div>";
}

function del(i){
let u=users[current];
u.data.splice(u.data.length-1-i,1);
save();
renderHome();
}

/* SETTINGS */
function renderSet(){
let u=users[current];

view.innerHTML=`
<div class="card">

<h3>카테고리</h3>
${u.categories.map((c,i)=>`
<div class="row">
<input value="${c}" onchange="editCat(${i},this.value)">
<button onclick="delCat(${i})">삭제</button>
</div>
`).join("")}

<div class="row">
<input id="newCat">
<button onclick="addCat()">추가</button>
</div>

<hr>

<h3>지출방식</h3>
${u.methods.map((m,i)=>`
<div class="row">
<input value="${m}" onchange="editMethod(${i},this.value)">
<button onclick="delMethod(${i})">삭제</button>
</div>
`).join("")}

<div class="row">
<input id="newMethod">
<button onclick="addMethod()">추가</button>
</div>

</div>
`;
}

function addCat(){
if(newCat.value){
users[current].categories.push(newCat.value);
save(); renderSet();
}
}

function editCat(i,v){
users[current].categories[i]=v;
save();
}

function delCat(i){
users[current].categories.splice(i,1);
save(); renderSet();
}

function addMethod(){
if(newMethod.value){
users[current].methods.push(newMethod.value);
save(); renderSet();
}
}

function editMethod(i,v){
users[current].methods[i]=v;
save();
}

function delMethod(i){
users[current].methods.splice(i,1);
save(); renderSet();
}

/* STATS */
function renderStats(){
view.innerHTML="<div class='card'>통계 준비중</div>";
}

/* POPUP */
function openPopup(){
popup.style.display="block";

popup.innerHTML=`
<div class="card">
<input type="date" id="d">
<input type="number" id="a" placeholder="금액">

<select id="type">
<option>수입</option>
<option>지출</option>
</select>

<select id="cat">
${users[current].categories.map(c=>`<option>${c}</option>`).join("")}
</select>

<select id="method">
${users[current].methods.map(m=>`<option>${m}</option>`).join("")}
</select>

<button onclick="saveData()">저장</button>
<button onclick="popup.style.display='none'">닫기</button>
</div>
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
popup.style.display="none";
renderHome();
}

renderHome();
