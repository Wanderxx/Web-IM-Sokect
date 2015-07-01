var app = require('express')();
var http = require('http').Server(app);
var io=require('socket.io')(http);
var clients=[]; //record all clients
var client=function(username,socket){
	this.username=username;
	this.socket=socket;
}

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
	//console.log('a user connected.');
	 socket.on('disconnect',function(){
	 	console.log('user disconnected');
		removeSocket(socket);
	 });
	socket.on('chat message',function(msg){
		console.log('from socket' +socket.id);
		console.log('message: ' + msg.txt + ' from ' + msg.from + ' to ' + msg.to);
		if(clients.indexOf(socket)<=-1){
			clients.push(new client(msg.from,socket)); // add new client
		}
		var skt=findSocketByUser(msg.to);
		if(skt!=null) {
			console.log('socket' +socket.id + ' skt ' +skt.id);
			skt.emit('chat message', msg); //socket is only for that socket, io will broadcast
		}
	});

	socket.on('sign up',function(user){
		console.log('on sign up from '+ user);
		var skt=findSocketByUser(user);
		if(skt==null)
		  clients.push(new client(user,socket));
		return;
	});

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


function removeSocket(socket){
	for(var i=0;i<clients.length;i++){
		if(clients[i].socket==socket){
			clients.splice(i,1);//remove this client
		}
	}
}

function findSocketByUser(user){
	for(var i=0;i<clients.length;i++){
		if(clients[i].username==user){
			return clients[i].socket;
		}
	}
	return null;
}
