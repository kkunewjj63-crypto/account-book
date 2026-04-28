let data = JSON.parse(localStorage.getItem("data") || "[]");

function save(){
  localStorage.setItem("data", JSON.stringify(data));
}

function render(){

  let income = 0;
  let expense = 0;

  let html = "";

  data.slice().reverse().forEach(d=>{

    let amt = Number(d.amount) || 0;

    if(d.type === "수입") income += amt;
    else expense += amt;

    html += `
      <div class="item">
        <b>${d.date}</b><br>
        <span style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
          ${d.type} ${amt.toLocaleString()}
        </span><br>
        <small>${d.category || ""} / ${d.method || ""}</small><br>
        <small>${d.memo || ""}</small>
      </div>
    `;
  });

  document.getElementById("view").innerHTML = html || "데이터 없음";

  document.getElementById("income").innerText = income.toLocaleString();
  document.getElementById("expense").innerText = expense.toLocaleString();
}

function add(){

  let amt = Number(amount.value);

  if(!amt){
    alert("금액 입력");
    return;
  }

  data.push({
    date: date.value || new Date().toISOString().split("T")[0],
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

function tab(name){
  alert("탭: " + name);
}

function openPopup(){
  popup.style.display="block";
}

function closePopup(){
  popup.style.display="none";
}

render();
