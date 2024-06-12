const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require('fs').promises;

let dbPath = path.join(process.cwd(), "DB", "data.db");  
  
async function createDatabaseFile() {    
  try {    
    // 尝试访问文件，如果文件不存在，将抛出错误    
    await fs.access(dbPath, fs.constants.F_OK);    
    console.log('Database file already exists.');    
  } catch (error) {    
    // 如果访问失败（即文件不存在），则创建文件    
    if (error.code === 'ENOENT') {    
      try {    
        // 确保DB目录存在    
        const dirPath = path.dirname(dbPath);    
        await fs.mkdir(dirPath, { recursive: true }); // 创建DB目录（如果需要）    
    
        // 创建data.db文件    
        await fs.writeFile(dbPath, ''); // 写入空字符串来创建文件    
        console.log('Database file created successfully!'); 
        await addTable()   
      } catch (writeError) {    
        console.error('Error creating database file:', writeError);    
        // 在这里你可以选择抛出错误或继续执行，但通常最好抛出错误  
        throw writeError;  
      }    
    } else {    
      // 访问文件失败但原因不是文件不存在    
      console.error('Error accessing database file:', error);  
      // 在这里你也可以选择抛出错误  
      throw error;  
    }    
  }    
}  

async function addTable() {
  const db = new sqlite3.Database(dbPath, (err) => {  
    if (err) {  
      reject(err); // 如果有错误，拒绝Promise  
    } else { 
      db.run(
        `CREATE TABLE IF NOT EXISTS users (  
          id INTEGER PRIMARY KEY AUTOINCREMENT,  
          username TEXT NOT NULL UNIQUE,  
          password TEXT NOT NULL,  
          avatar_url TEXT,  
          role TEXT NOT NULL DEFAULT 'user', 
          userID TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),  
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')) 
        )
      `,
        (err) => {
          if (err) {
            console.log(err.message);
          }
            // 查询 users 表中的第一条数据  
          db.get('SELECT * FROM users LIMIT 1', [], (err, row) => {  
            if (err) {  
              return console.error(err.message);  
            }  
            if (!row) {  
              console.log('检测到users表为空，正在初始化数据...');
            const users = [
              {
                username: "admin",
                password: "admin",
                avatar_url:"/images/system.jpg",
                role: "admin",
                ip: "127.0.0.1",
                userID:"9c766cc9-b5c1-4d2c-bc70-80680f3bd388",
              },
              {
                username: "system",
                password: "123",
                avatar_url:"/images/system.jpg",
                role: "system",
                ip: "127.0.0.1",
                userID:"9c766cc9-b5c1-4d2c-bc70-999999999999",
              },
              // ... 添加其他用户数据
            ];
        
            // 准备 SQL 语句模板
            const sql =
              "INSERT INTO users (username, password, avatar_url, role,userID) VALUES (?, ?, ?, ?,?)";
            // 批量插入数据
            db.serialize(() => {
              users.forEach((user) => {
                db.run(
                  sql,
                  [
                    user.username,
                    user.password,
                    user.avatar_url,
                    user.role,
                    user.userID,
                  ],
                  function (err) {
                    if (err) {
                      return console.error(err.message);
                    }
                    console.log(`默认用户 ${user.username}已添加到users表中`);
                    
                  }
                );
              });
            });
            console.log('初始化完毕');
            } })
        }
      );

      //创建房间表
     let  msgSql = `CREATE TABLE messages (  
      id INTEGER PRIMARY KEY AUTOINCREMENT,  
      sender_id TEXT NOT NULL,  
      content TEXT, 
      content_url TEXT,  
      content_type TEXT NOT NULL DEFAULT 'text', 
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')) 
  )`
  //content_type -- 'text', 'image' 等  
      db.run(msgSql,(err) => {
        if (err) {
          console.log(err.message);
        }
        // 查询 rooms 表中的第一条数据
        db.get('SELECT * FROM messages LIMIT 1', [], (err, row) => {  
          if (err) {  
            return console.error(err.message);  
          }  
          if (!row) {  
            console.log('检测到messages表为空，正在初始化数据...');
          const msgArr = [
            {
              sender_id:"9c766cc9-b5c1-4d2c-bc70-999999999999",
              content: "您好我的朋友欢迎来到聊天室",
              content_type:'text',
             
            },
            {
              sender_id:"9c766cc9-b5c1-4d2c-bc70-80680f3bd388",
              content: "这是测试消息",
              content_type:'text',
            }
            // ... 添加其他用户数据
          ];
      
          // 准备 SQL 语句模板
          const sql =
            "INSERT INTO messages (sender_id, content,content_type) VALUES (?, ?, ?)";
          // 批量插入数据
          db.serialize(() => {
            msgArr.forEach((msg) => {
              db.run(
                sql,
                [
                  msg.sender_id,
                  msg.content,
                  msg.content_type,
                ],
                function (err) {
                  if (err) {
                    return console.error(err.message);
                  }
                  console.log(`默认消息 ${msg.content}已添加到messages表中`);
                  
                }
              );
            });
          });
          console.log('初始化完毕');
          } })
    })

    }  
  }); 

  
}

setTimeout(async()=>{await connectToDatabase()},0)


// 封装数据库连接到Promise中  
async function connectToDatabase() {  
  return new Promise(async (resolve, reject) => {  
    try {  
      // 等待文件创建完成  
      await createDatabaseFile();  
  
      // 创建数据库连接  
      const db = new sqlite3.Database(dbPath, (err) => {  
        if (err) {  
          reject(err); // 如果有错误，拒绝Promise  
        } else { 
          resolve(db); // 如果没有错误，解析Promise并返回数据库连接对象  
        }  
      });  
  
      // 注意：这里没有显示地关闭数据库连接，通常你会在应用程序结束时或在不再需要时关闭它  
  
    } catch (error) {  
      reject(error); // 如果在文件创建过程中发生错误，拒绝Promise  
    }  
  });  
}  
module.exports={
  connectToDatabase,
};


// 当应用程序结束时，关闭数据库连接
process.on("exit", () => {
  //db.close();
});


