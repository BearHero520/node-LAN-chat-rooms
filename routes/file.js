var express = require('express');
var router = express.Router();
const multer = require('multer');  
const path = require('path');  
const fs = require('fs').promises;  
const crypto = require('crypto');

const upload = multer({ dest: 'uploads/' }); // 临时存储位置  
  
// 处理文件上传的路由  
router.post('/upload', upload.single('file'), async (req, res, next) => {  
  try {  
    const file = req.file;  
    if (!file) {  
      return res.status(400).send('No file uploaded.');  
    }  
  
    // 生成唯一文件名（这里使用了哈希值）  
    const fileName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);  
  
    // 构造存储目录（年月日）  
    const today = new Date();  
    const year = today.getFullYear();  
    const month = String(today.getMonth() + 1).padStart(2, '0');  
    const day = String(today.getDate()).padStart(2, '0');  
    const storageDir = `./uploads/${year}/${month}/${day}`;  
  
    // 确保目录存在  
    await fs.mkdir(storageDir, { recursive: true });  
  
    // 构造文件保存路径  
    const targetPath = path.join(storageDir, fileName);  
  
    // 将临时文件移动到目标路径  
    await fs.rename(file.destination + '/' + file.filename, targetPath);  
  
    // 构造返回给前端的文件URL（假设服务器运行在localhost上，端口为3000）  
    const fileUrl = `/files/${year}/${month}/${day}/${fileName}`;  
    // 返回文件URL给前端  
    res.send(fileUrl);  
  } catch (err) {  
    next(err); // 如果有错误，传递给错误处理中间件  
  }  
});  

//读取文件 绝对路径
 router.use('/files', express.static(path.join(process.cwd(), 'uploads'))); 
 //相对路径
//router.use('/files', express.static('uploads'))
console.log(path.join(process.cwd(), 'uploads'),'2333');
module.exports = router;