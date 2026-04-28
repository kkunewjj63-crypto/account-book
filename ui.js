const UI = {

  render(data){

    const view = document.getElementById("view");
    const sum = Analytics.summary(data);

    income.innerText = sum.inS.toLocaleString();
    expense.innerText = sum.outS.toLocaleString();

    view.innerHTML = data.slice().reverse().map(d=>`
      <div class="item">
        <b>${d.date}</b><br>
        <span style="color:${d.type==='수입'?'#007aff':'#ff3b30'}">
          ${d.type} ${(Number(d.amount)||0).toLocaleString()}
        </span><br>
        <small>${d.category||""} / ${d.method||""}</small><br>
        <small>${d.memo||""}</small>
      </div>
    `).join("") || "데이터 없음";
  }
};