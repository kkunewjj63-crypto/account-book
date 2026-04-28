const Analytics = {

  summary(data){
    let inS = 0, outS = 0;

    data.forEach(d=>{
      let a = Number(d.amount) || 0;
      if(d.type === "수입") inS += a;
      else outS += a;
    });

    return {inS, outS};
  }
};