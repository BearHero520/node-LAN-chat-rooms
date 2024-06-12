
var { connectToDatabase } = require('../DB/db');

async function verifyID(id) {  
    // 假设 connectToDatabase 返回一个 Promise  
    let db = await connectToDatabase();  
  
    // 使用 Promise 封装数据库查询操作  
    return new Promise((resolve, reject) => {  
        // 注意：这里使用了参数化查询来防止 SQL 注入  
        db.get(`SELECT * FROM users WHERE userID = ?`, [id], (err, row) => {  
            if (err) {  
                // 传递错误给 reject  
                reject(err);  
            } else if (!row) {  
                // 如果没有找到用户，可以传递一个特定的错误或者自定义的拒绝原因  
                reject(new Error('User not found'));  
            } else {  
                // 如果找到了用户，则解析 Promise  
                resolve(row); // 也可以返回 row，以便调用者可以使用用户数据  
            }  
        });  
    });  
}  

async function saveMessage(sender_id, data) {  
    const { content, content_type, content_url } = data;  
    console.log(`收到消息：${sender_id} - ${content}`);  
    
    try {  
      let db = await connectToDatabase();  
      const sql = "INSERT INTO messages (sender_id, content, content_type, content_url) VALUES (?, ?, ?, ?)";  
      db.run(sql, [sender_id, content, content_type, content_url], function (err) {  
        if (err) {  
          throw err; // 重新抛出错误，以便在 catch 块中捕获  
        }  
        console.log(`一条消息 ${content} 已添加到 messages 表中`);  
      });  
      // 注意：这里假设 db.run 是同步的，或者您可能需要使用其他方法来处理异步操作  
    } catch (error) {  
      console.error('sql 错误：', error.message);  
      // 可以选择在这里抛出错误，以便调用者可以处理它  
      // throw error;  
    }  
  }


module.exports = {
    verifyID,
    saveMessage
  };
