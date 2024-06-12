 const errFun = (code,msg)=>{
    return {
        code: code ? code:500,
        msg:msg?msg: 'Internal Server Error',
        data: null
      }
}


module.exports = {
  err:errFun
};