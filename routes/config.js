const os = require('os');  
var express = require('express');
var router = express.Router();
var app = express();
function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }
  

//存默认端口
const port = normalizePort(process.env.PORT || '3333');
//ws 端口
const wsPort = normalizePort(process.env.WS_PORT || '3334');

function getAllIPv4Addresses() {  
    let interfaces = os.networkInterfaces();  
    let addresses = [];  
    for (let interfaceName in interfaces) {  
        let interfaceInfo = interfaces[interfaceName];  
  
        for (let info of interfaceInfo) {  
            if (info.family === 'IPv4' && !info.internal) {  
                addresses.push(`http://${info.address}:${port}`);  
            }  
        }  
    }  
  
    return addresses; // 返回一个包含所有非内部 IPv4 地址的数组  
  }  

  function getWsUrl() {  
    let interfaces = os.networkInterfaces();  
    let addresses = [];  
    for (let interfaceName in interfaces) {  
        let interfaceInfo = interfaces[interfaceName];  
        for (let info of interfaceInfo) {  
            if (info.family === 'IPv4' && !info.internal) {  
                addresses.push(`ws://${info.address}:${wsPort}`);  
            }  
        }  
    }  
  
    return addresses[0]; // 返回一个包含所有非内部 IPv4 地址的数组  
  }  
  

  router.get('/config',async (req, res) => {  
    res.json({
      ipArr:await getAllIPv4Addresses(),
      wsUrl:await getWsUrl()
    });  
  });

// 导出路由和端口  
module.exports = {  
    router: router,  
    port: port,
    wsPort:wsPort
  };