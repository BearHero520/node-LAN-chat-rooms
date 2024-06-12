var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var fileRouter = require('./routes/file');
var configRouter = require('./routes/config');
var wsInfo = require('./routes/ws');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(indexRouter);
app.use(usersRouter);
app.use(fileRouter);
app.use(configRouter.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
      res.send(200);
  }else {
      next();
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

process.on('uncaughtException', (err) => {  
  console.error('全局捕获到未捕获的异常：', err);  
  console.error('Node.js 不会因为这次异常而退出');  
  // 这里可以添加一些清理逻辑，比如关闭文件描述符、数据库连接等  
  // 但是不推荐在这里重启应用，因为这可能会掩盖更严重的问题  
});

module.exports = app;
