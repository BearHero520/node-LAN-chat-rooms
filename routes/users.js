var express = require('express');
var router = express.Router();
var { connectToDatabase } = require('../DB/db');
var errorFun = require('./err');
const uuid = require('uuid/v4');





const addUser =async (username,password = username)=>{
  const sql =
  "INSERT INTO users (username, password, avatar_url, role,userID) VALUES (?, ?, ?, ?,?)";
  const db = await connectToDatabase();
  let info = [username,password,'/images/other.png','user',uuid()]
  db.run(
    sql,
    info,
    function (err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`一个用户 ${username}已添加到users表中`);
    }
  );
  return {
    username: info[0],
          avatar_url: info[2],
          role: info[3],
          userID: info[4],
  }
}

router.post('/user/login', async function (req, res, next) {
  const { username, password } = req.body;
  const db = await connectToDatabase()
  //查询是否存在该账户
  db.get('SELECT * FROM users WHERE username = ?', [username],async (err, row) => {
    if (err) next(err)
    if (!row) {
      res.json({
        code: 200,
        msg: '当前账号不存在,将自动创建账户',
        data:await addUser(username,password)
      })
      return
    }
    if (row.password === password) {
      res.json({
        code: 200,
        msg: '登录成功',
        data:{
          username: row.username,
          avatar_url: row.avatar_url,
          role: row.role,
          userID: row.userID,
        }
      })
    }else{
      res.json({
        code: 201,
        msg: '密码错误！',
        data: null
      })
    }
  })
})


router.get('/msg', async function (req, res, next) {
  const db = await connectToDatabase()
  const { userID } = req.query;
  db.get('SELECT * FROM users WHERE userID = ?', [userID], (err, row) => {
    if (err) next(err)
    if (!row) {
      res.json({
        code: 201,
        msg: '非法访问！',
        data:null
      })
    }
    if(row){
      let sql = `
      SELECT   
          u.username,   
          u.avatar_url,   
          m.content,   
          m.content_url,   
          m.content_type,   
          m.sender_id AS userID,   
          u.role,
          m.timestamp 
      FROM   
          messages m  
      LEFT JOIN   
          users u ON m.sender_id = u.userID  
  `
      db.all(sql,(err, row)=>{
        res.json({
          code: 200,
          msg: '获取成功！',
          data:row
        })
      })
    }
  })
})




/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
