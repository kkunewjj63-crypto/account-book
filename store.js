const Store = {
  key: "account_data",

  load(){
    try{
      return JSON.parse(localStorage.getItem(this.key)) || [];
    }catch(e){
      return [];
    }
  },

  save(data){
    localStorage.setItem(this.key, JSON.stringify(data));
  }
};