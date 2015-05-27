	

	// ------------------------------------------------------------------------- SETTINGS
	// ----------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------

	var set = {   
		w: 10,
		h: 10,
		ranc: false,
		rr:0,
		gg:0,
		bb:0,
		r: function(){
			if(this.ranc){ return Math.round(Math.random()*255) }
			else { return this.rr }
		},
		g: function(){
			if(this.ranc){ return Math.round(Math.random()*255) }
			else { return this.gg }
		},
		b: function(){
			if(this.ranc){ return Math.round(Math.random()*255) }
			else { return this.bb }
		},
		a: 0.5,

		tool: 'pen',

		pen: 'solid',
		stamp: 'circles',
		spray: 'paint'
	}



	// ------------------------------------------------------------------------- CONTROLS
	// ----------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------

	$('#pen').on({ click:function(){ 
		
		set.tool = 'pen'; 
		socket.emit('update settings', {user:username, settings:set} );

		hideSubmenu('pen');
		if( $('#submenu-pen').css('display')=='none' )  $('#submenu-pen').toggle('slide');
		mainSelect(this);

	}});


		$('#pensolid').on({click:function(){ subSelect(this, 'pen', 'solid');  }});
		$('#pensoft').on({click:function(){ subSelect(this, 'pen', 'soft');  }});
		$('#pencalig').on({click:function(){ subSelect(this, 'pen', 'calig');  }});
		$('#penlines').on({click:function(){ subSelect(this, 'pen', 'lines');  }});


	$('#stamp').on({ click:function(){ 
		
		set.tool = 'stamp'; 
		socket.emit('update settings', {user:username, settings:set} );
		
		hideSubmenu('stamp');
		if( $('#submenu-stamp').css('display')=='none' )  $('#submenu-stamp').toggle('slide');
		mainSelect(this);

	}});

		$('#submenu-stamp').toggle('slide');

		$('#stampcircles').on({click:function(){ subSelect(this, 'stamp', 'circles');  }});
		$('#stampcircslash').on({click:function(){ subSelect(this, 'stamp', 'circslash');  }});
		$('#stampcube').on({click:function(){ subSelect(this, 'stamp', 'cube');  }});
		$('#stampflames').on({click:function(){ subSelect(this, 'stamp', 'flames');  }});
		$('#stampgrid').on({click:function(){ subSelect(this, 'stamp', 'grid');  }});
		$('#stampheart').on({click:function(){ subSelect(this, 'stamp', 'heart');  }});
		$('#stamplocking').on({click:function(){ subSelect(this, 'stamp', 'locking');  }});
		$('#stampseal').on({click:function(){ subSelect(this, 'stamp', 'seal');  }});
		$('#stampstar').on({click:function(){ subSelect(this, 'stamp', 'star');  }});

	$('#spray').on({ click:function(){ 
		
		set.tool = 'spray'; 
		socket.emit('update settings', {user:username, settings:set} );
		
		hideSubmenu('spray');
		if( $('#submenu-spray').css('display')=='none' )  $('#submenu-spray').toggle('slide');
		mainSelect(this);

	}});

		$('#submenu-spray').toggle('slide');

		$('#sprayleafs').on({click:function(){ subSelect(this, 'spray', 'leafs');  }});
		$('#spraypaint').on({click:function(){ subSelect(this, 'spray', 'paint');  }});
		$('#spraystars').on({click:function(){ subSelect(this, 'spray', 'stars');  }});
		$('#sprayweb').on({click:function(){ subSelect(this, 'spray', 'web');  }});


	$('#eraser').on({ click:function(){ 
		set.tool = 'eraser'; 
		socket.emit('update settings', {user:username, settings:set} );
		hideSubmenu();
		mainSelect(this);
	}});

	//

	function mainSelect( ele ){
		$(".icon").each(function(){
			$(this).css('opacity',0.5);
		});
		$(ele).css('opacity',1);
	}

	function subSelect( ele, tool, val ){
		if(tool=='pen') set.pen = val;
		if(tool=='stamp') set.stamp = val;
		if(tool=='spray') set.spray = val;
		$(ele).parent().children().each(function(){
			$(this).css('opacity',0.5)
		});
		$(ele).css('opacity',1);
		socket.emit('update settings', {user:username, settings:set} );
	}

	function hideSubmenu( exception ){
		if( $('#submenu-pen').css('display')!='none' && exception!='pen' )  $('#submenu-pen').toggle('slide');
		if( $('#submenu-stamp').css('display')!='none' && exception!='stamp' )  $('#submenu-stamp').toggle('slide');
		if( $('#submenu-spray').css('display')!='none' && exception!='spray' )  $('#submenu-spray').toggle('slide');
	}


	// draw functions called in setup.js mouse events 
	function updateSettings(u){
		set.rr = u.rr; set.gg = u.gg; set.bb = u.bb;
		set.w = u.w; set.h = u.h;
		set.ranc = u.ranc;
		set.a = u.a;
		set.tool = u.tool;
		set.pen = u.pen; 
		set.stamp = u.stamp; 
		set.spray = u.spray;
	}

	function startDraw(x,y){ 
		switch (set.tool){
			case "pen" : pen.draw(x,y); break;
			case "eraser" : eraser.draw(x,y); break;
			case "stamp" : stamp.draw(x,y); break;
			case "spray" : spray.draw(x,y); break;
		}
	}

	function stopDraw(){
		switch (set.tool){
			case "pen" : pen.reset(); break;
			case "eraser" : eraser.reset(); break;
			case "stamp" : /**/; break;
		}
	}

	var hold = false;
	$('.icon, .sub').on({
		mouseenter: function(){ hold = true; },
		mouseout: function(){ hold = false; }
	});


	// ---------------------------------------------------------- color picker tool setup --------------
	var gcanvas, clr;		// color gradient canvas 
	var swatches = [];		// collect swatches
	var clrLayer = false;	// showing color gradient
	var picker; 			// for the current color layer

	function makeGradient() {             
		gcanvas = document.createElement("canvas");
		gcanvas.width = window.innerWidth;
		gcanvas.height = window.innerHeight;
		$('#colorlayer').append(gcanvas);
		clr = gcanvas.getContext("2d");
		// --
        var grad = clr.createLinearGradient(0, 0, gcanvas.width, 0);
        grad.addColorStop(0.00, 'hsl(0, 100%, 50%)');
		grad.addColorStop(0.15, 'hsl(54, 100%, 50%)');
		grad.addColorStop(0.30, 'hsl(108, 100%, 50%)');
		grad.addColorStop(0.50, 'hsl(180, 100%, 50%)');
		grad.addColorStop(0.65, 'hsl(234, 100%, 50%)');
		grad.addColorStop(0.80, 'hsl(288, 100%, 50%)');
		grad.addColorStop(1.00, 'hsl(360, 100%, 50%)');
		var blk = clr.createLinearGradient(0, 0, 0, gcanvas.height);
        blk.addColorStop(0.00, 'rgba(0,0,0,0)');
        blk.addColorStop(0.50, 'rgba(0,0,0,0)');
        blk.addColorStop(1.00, 'rgba(0,0,0,1)');
        var wht = clr.createLinearGradient(0, 0, 0, gcanvas.height);
        wht.addColorStop(0.00, 'rgba(255,255,255,1)');
        wht.addColorStop(0.50, 'rgba(255,255,255,0)');
        wht.addColorStop(1.00, 'rgba(255,255,255,0)');
        // --
        clr.fillStyle = grad;
        clr.fillRect(0, 0, gcanvas.width, gcanvas.height);
        clr.fillStyle = blk;
        clr.fillRect(0, 0, gcanvas.width, gcanvas.height);
        clr.fillStyle = wht;
        clr.fillRect(0, 0, gcanvas.width, gcanvas.height);
	} makeGradient();


	function randomcolor(){ 
		set.ranc = true;
		// $('.colorPicker').css('background','url(images/color.png)')
	}

	function getColor(x,y){
		var imageData = clr.getImageData(0, 0, gcanvas.width, gcanvas.height);
		var data = imageData.data;
		var index = (y * 4 * gcanvas.width) + (x * 4);
		var red = data[index];
		var green = data[index + 1];
		var blue = data[index + 2];
		// --
		set.ranc = false;
		set.rr = red; set.gg = green; set.bb = blue;
		// --
		return { r:red, g:green, b:blue }
	}

	$('#colorlayer').on({
		mousedown: function(e){
			// colDown = true;
		},
		mouseup: function(e){
			var col = getColor(e.clientX, e.clientY);
			set.rr = col.r;
			set.gg = col.g;
			set.bb = col.b;
			socket.emit('update settings', {user:username, settings:set} );
			clrLayer = false; 
			$('#colorlayer').fadeOut();
		}
	});


	// ---------------------------------------------------------- for resizing --------------
	var resizing = false;
	

	function resize( x,y ){
		// var sizeX = Math.map(  x/window.innerWidth, 0,1, 200, 0);
		var sizeY = Math.map(  y/window.innerHeight, 0,1, 200, 0);
		var sizeX = sizeY;
		set.w = sizeX;
		set.h = sizeY;
		$('#sizePicker').css({
			'width':sizeX+"px",
			'height':sizeY+"px",
			'margin-left':-(sizeX/2)+"px",
			'margin-top':-(sizeY/2)+"px"
		});
	}

	function isSizing( val ){
		resizing = val;
		if(resizing){
			$('#sizePicker').css('display','block');
			$(canvas).css('opacity','0.3');
		} else {
			$('#sizePicker').css('display','none');
			$(canvas).css('opacity','1');		
		}
	}
