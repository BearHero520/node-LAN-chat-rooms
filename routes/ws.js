var express = require('express');
// 引入ws模块  
const WebSocket = require('ws');
const configRouter = require('./config');
const MessageFun = require('./message');
// 创建一个WebSocket服务器   
const wss = new WebSocket.Server({ port: configRouter.wsPort });


// 假设HEARTBEAT_INTERVAL是发送心跳的间隔（毫秒）  
const HEARTBEAT_INTERVAL = 1e4; // 5秒  
// 假设HEARTBEAT_TIMEOUT是等待pong响应的超时时间（毫秒）  
const HEARTBEAT_TIMEOUT = 3000; // 3秒  



// 客户端集合  
const clients = new Map();

// 为每个连接添加处理程序  
wss.on('connection', (ws) => {
  console.log('Client connected');
  // 将WebSocket实例添加到clients Map中  
  clients.set(ws, { lastPing: Date.now() });

  // 发送心跳消息  
  function sendPing() {
    if (clients.has(ws) && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      console.log('服务器向客户端发送 ping 值');

      // 更新lastPing时间戳  
      clients.get(ws).lastPing = Date.now();

      // 设置或重置超时定时器  
      const timeout = setTimeout(() => {
        if (clients.has(ws) && ws.readyState === WebSocket.OPEN) {
          // 如果在这个时间内没有收到pong，则关闭连接  
          if (Date.now() - clients.get(ws).lastPing >= HEARTBEAT_TIMEOUT) {
            console.log('客户端未响应 ping，关闭当前连接');
            ws.close();
            clients.delete(ws);
          }
        }
      }, HEARTBEAT_TIMEOUT);

      // 保存这个定时器，以便稍后可以清除它  
      clients.get(ws).timeout = timeout;
    }
  }

  // 设置发送心跳的间隔  
  const pingInterval = setInterval(sendPing, HEARTBEAT_INTERVAL);

  // 当WebSocket实例关闭时  
  ws.on('close', () => {
    console.log('断开连接');

    // 清除超时定时器和发送心跳的间隔  
    if (clients.has(ws) && clients.get(ws).timeout) {
      clearTimeout(clients.get(ws).timeout);
    }
    clearInterval(pingInterval);

    // 从clients Map中删除WebSocket实例  
    clients.delete(ws);
  });

  // 当接收到消息时  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      if (!message.userID) {
        ws.send(JSON.stringify({ type: 'error', message: '用户ID不能为空', timestamp: Date.now() }));
        ws.close();
        clients.delete(ws);
        return
      }
      if (message.type === 'pong') {
        // 当收到pong时，可以清除之前的超时定时器（如果已设置）  
        if (clients.has(ws) && clients.get(ws).timeout) {
          clearTimeout(clients.get(ws).timeout);
        }
        console.log('服务器从客户端接收 pong');
        return
      }

      if (message.type === 'msg') {
        // if(await MessageFun.verifyID(message.userID)){
        //   console.log('通过验证');
        //   await MessageFun.saveMessage(message.userID,message.data)
        // }
        MessageFun.verifyID(message.userID)
          .then(async (userRow) => {
            console.log(userRow,'userRow');
            MessageFun.saveMessage(message.userID, message.data)
            // 广播消息到所有客户端（除了发送者）
            for (const [clientWs, info] of clients) {
              if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
                console.log('向客户端发送消息');
                //const { content, content_type, content_url } = data;  
                let temp = message;

                temp.data.username = userRow.username
                temp.data.avatar = userRow.avatar
                temp.data.userID = userRow.userID
                temp.data.timestamp= Date.now()
                clientWs.send(JSON.stringify(temp));
              }
            }

          })



      }


      // 这里可以添加其他消息处理逻辑  
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
});

// 服务器开始监听端口  
console.log('WebSocket服务器已启动端口为' + configRouter.wsPort);
// 导出WebSocket服务器（如果需要的话，但通常不需要直接导出）  
module.exports = wss // 如果你需要在其他地方访问WebSocket服务器，可以取消注释这行代码