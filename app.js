let users = JSON.parse(localStorage.getItem("users") || JSON.stringify({
personal:{data:[]},
family:{data:[]}
}));

let current = localStorage.getItem("current") || "personal";

function save(){
localStorage.setItem("users",JSON.stringify(users));
}

/* USER */
function switchUser(u){
current=u;
localStorage.setItem("current",u);
render();
}

/* RENDER */
function render(){

btnP.classList.toggle("active",current==="personal");
btnF.classList.toggle("active",current==="family");

let data = users[current].data;

let grouped={};

data.forEach(d=>{
if(!grouped[d.date]) grouped[d.date]=[];
grouped[d.date].push(d);
});

let html="";

Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).forEach(date=>{

html+=`<div class="card">
<div class="date">${date}</div>`;

grouped[date].forEach(d=>{
html+=`
<div class="item">
<div>${d.category} (${d.method})</div>
<div style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
${d.amount}
</div>
</div>`;
});

html+="</div>";
});

view.innerHTML = html || "<div class='card'>데이터 없음</div>";
}

/* INPUT */
function openSheet(){
sheet.classList.add("show");

sheet.innerHTML=`
<input type="date" id="d">
<input type="number" id="a" placeholder="금액">

<select id="type">
<option>지출</option>
<option>수입</option>
</select>

<input id="cat" placeholder="카테고리">
<input id="method" placeholder="결제수단">

<button class="primary" onclick="saveData()">저장</button>
<button onclick="closeSheet()">닫기</button>
`;
}

function closeSheet(){
sheet.classList.remove("show");
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
closeSheet();
render();
}

render();
