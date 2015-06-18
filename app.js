var app = require('express')();
var users = {};
var ids = {};
var canvases = [];

app.set('port', process.env.PORT || 3001);
// app.set('port', process.env.PORT || 80);


// sockets + server 
var io = require('socket.io').listen( app.listen(app.get('port')) );
// template -- hogan/mustache
app.engine('html', require('hogan-express'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// VERBS
app.get('/',function(req,res){
	res.render('index', { title: 'WHITEBOARD', header: 'Hello there!'});
});

app.get('/whiteboard', function(req, res){ // for bounce from ( bouncy )
    res.render('index', { title: 'WHITEBOARD', header: 'Hello there!'});
});

app.get('/js/*', function(req, res){
    res.sendFile(__dirname + '/public'+req.path);
});
app.get('/images/*', function(req, res){
    res.sendFile(__dirname + '/public'+req.path);
});



// io events ------------------------------------------
io.on('connection', function(socket){
	
	// check if user exists 
	socket.on('user check send',function(data){
		if(users.hasOwnProperty( data ))
			socket.emit('user check return', {status:true} );
		else
			socket.emit('user check return', {status:false, canvas: canvases[canvases.length-1] }  ); 
	});

	// create new user
	socket.on('new user', function(data){
		ids[socket.id] = {name:data.name}
		users[data.name] = { name:data.name, x:0, y:0, fader:0, idle:true, down:false, color:data.color, settings:data.settings };
  	});


 	// upon receiving a new message from client, emit to all users
	socket.on('user data', function(data){
		if(users[data.user]!=undefined){
			users[data.user].name = data.user;
			users[data.user].x = data.mx;
			users[data.user].y = data.my;
			users[data.user].down = data.down;			
			io.emit('show users', users[data.user] );
		}
	});

	// user is idle 
	socket.on('fadeMe',function(data){
		io.emit('fadeEm',data);
	});

	// new drawing data
	socket.on('drawing',function(data){
		var lastOne = canvases[ canvases.length-1 ];
		if(data != lastOne) canvases.push( data );
	});
	socket.on('undo',function(data){
		if(canvases.length>0){
			canvases.pop();
			io.emit('history', canvases[canvases.length-1] );
		}
	});


	// update settings emitted from tools.js
	socket.on('update settings',function(data){
		if(users[data.user]) users[data.user].settings = data.settings;
	});
	socket.on('req my settings',function(data){
		if(users[data]) io.emit('res my settings', users[data].settings );
	});
	
	// no more users connected, clean out users
	socket.on('disconnect', function(data){		
		
		if(io.engine.clientsCount <= 0) users = {};
		else {
			var name = ids[socket.id].name;
			delete users[name];
		}
  	});


});
