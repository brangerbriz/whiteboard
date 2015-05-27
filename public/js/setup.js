

	// GLOBALS --------------------------------------------------------

	var socket = io();

	var username, mx = my = 0;
	var color = {r:Math.floor(Math.random()*255), g:Math.floor(Math.random()*255), b:Math.floor(Math.random()*255) };
	var idle = true, timer = 3, down = false;

	var menuTimer = 2;
	var mouseIdle = true;

	var start = document.getElementById('start');
	var signin = document.getElementById('signin');
	var login = document.getElementById('login');
	var list = []; // keep track of what's inside userList




	// SETUP CANVAS ---------------------------------

	var canvas = document.createElement('canvas'), W, H;
		canvas.width = W = window.innerWidth;
		canvas.height = H = window.innerHeight;
	var blank = canvas.toDataURL();
	document.body.appendChild(canvas);
	var ctx = canvas.getContext('2d');





	// submit new user name --------------------------------------------------------	

	signin.onclick = function(){
		if(login.value==null||login.value==undefined||login.value==""){ 
			alert('u gotta create a user name');			// not a proper name
		} else {
			socket.emit('user check send', login.value);	// send for checking
		}
	}

	socket.on('user check return', function(data){
		if(data.status){
			alert('that name is already on the whiteboard');	// already in use
		}
		else {
			username = login.value;
			//alert('welcome '+ username);
			// start.style.display = "none";
			$(start).fadeOut();
			set.rr=color.r, set.gg=color.g, set.bb=color.b;
			socket.emit('new user', {name:username, color:color, settings:set } ); // MAKE NEW USER

			var img = new Image;
			img.onload = function(){ ctx.drawImage(img,0,0); }
			img.src = data.canvas;
			
		}
	});





	// RECEIVE USER INFO ----------------------------------------------------------------

	socket.on('show users', function(user){

		// handle name label -------------------
		if( !list.hasOwnProperty(user.name) ){
			list[user.name] = {};
			var label = document.createElement('div');
				label.innerHTML = user.name;
				label.setAttribute('id',user.name);
				label.style.position = "absolute";
				label.style.color = 'rgb('+user.color.r+','+user.color.g+','+user.color.b+')';
			document.getElementById('userList').appendChild(label);
			$(label).fadeOut(100);
		} 
		else {
			if(user.name!=username){
				$('#'+user.name).fadeIn();
				document.getElementById(user.name).style.left=user.x+"px";
	        	document.getElementById(user.name).style.top=user.y+"px";	
			}	    
		}

		// handle others drawing  ---------- functions in tools.js  ---------- DRAW _ DRAW _ DRAW
		if(user.name!=username && user.down){
			updateSettings(user.settings);
			startDraw(user.x, user.y);
		} 
		else if(user.name!=username && !user.down) {
			stopDraw();
		}


	});




	// MOUSE EVENTS && TIMERS -----------------------------------------------------------------------
	// ----------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------

	function fadeTimer(){
		timer--;
		if(timer>0){ setTimeout(fadeTimer, 1000); } 
		else {
			timer = 3; idle = true;
			socket.emit('fadeMe',username);
		}
	}

	socket.on('fadeEm',function(user){ $('#'+user).fadeOut(); }); // fade out if not moving

	function hideMenu(){
		menuTimer--;
		if(menuTimer>0){ setTimeout(hideMenu, 1000); } 
		else {
			menuTimer = 3; mouseIdle = true;
			$('#toolbar').fadeOut();
			$('#nfo').fadeOut();
		}
	}

	document.onmousemove = function(event){
		
		// sender users nfo to server ---
		mx = event.clientX; my = event.clientY;
		var send = { user: username, mx:mx, my:my, down:down };
		socket.emit('user data', send);		

		// timer to set when idle -----
		timer = 3;
		if(idle){ fadeTimer(); }
		idle = false;

		// timer for toolbar 
		$('#toolbar').fadeIn();
		$('#nfo').fadeIn();
		menuTimer = 2;
		if(mouseIdle){ hideMenu(); }
		mouseIdle = false;

		if(resizing) resize(event.clientX, event.clientY);


		// users drawing ---------- functions in tools.js  ---------- DRAW _ DRAW _ DRAW
		if(username && down && !clrLayer && !hold){ 
			startDraw(mx,my);
		} else {
			stopDraw();
		}

	}
	socket.on('res my settings',function(data){ updateSettings(data); });


	document.onmousedown = function(e){ 
		if(username){
			socket.emit('req my settings', username);
			down=true; 
		}
	}
	document.onmouseup = function(event){ 
		if(username){
			down=false; 
			var drawing = canvas.toDataURL();
			if(drawing != blank) socket.emit('drawing',drawing);
		}
	}


	document.onkeydown=function(event){
		if(username){
			var key = (event.keyCode ? event.keyCode : event.which);
		    // console.log(key)
		    if(key==85){ // U for undo
		    	// socket.emit('undo', canvas.toDataURL());  //<<<<<< CHANGE THE UNDO
		    }
		    if(key==83){ // S for size
		    	isSizing(true);
		    }
		}   
	}
	document.onkeyup=function(event){
		if(username){
			var key = (event.keyCode ? event.keyCode : event.which);
		    if(key==67){ // C for color
		    	if(clrLayer){ clrLayer = false; $('#colorlayer').fadeOut() }
		    	else { clrLayer = true; $('#colorlayer').fadeIn() }
		    }
		    if(key==83){ // S for size
		    	isSizing(false);
		    	socket.emit('update settings', {user:username, settings:set} );
		    }
		    if(key==82){ // R for random color
		    	set.ranc = true;
		    	socket.emit('update settings', {user:username, settings:set} );
		    }
		}
	}


	socket.on('history', function(states){ // ---- undo -----------
		ctx.clearRect(0,0,canvas.width,canvas.height);
		var prevState = new Image();
		prevState.src = states;
		prevState.onload = function(){
			ctx.drawImage(prevState, 0, 0);	
		}
	});