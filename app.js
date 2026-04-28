let data = Store.load();

const App = {

  init(){
    UI.render(data);
  },

  add(){

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

    Store.save(data);
    UI.render(data);
    this.close();
  },

  tab(name){
    alert("탭: " + name);
  },

  open(){
    popup.style.display="block";
  },

  close(){
    popup.style.display="none";
  }
};

App.init();