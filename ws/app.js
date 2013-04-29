var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , users = new Array;


server.listen(8001);

app.get('/newuser', function (req,res) {
	var id = Math.random().toString(36).substr(2, 9);
	users.push(id);
//	res.writeHead(200, {"Content-Type": "application/json"});
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Content-Type", "application/json");
	res.end(JSON.stringify({ user : id }));
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});