var Socket = {
	host: null,
	io: null,
	EOL: "\r\n",
	connected: false,
	
	connect: function (mServer, ioServer) {
		
		this.host = 'ws://' + ioServer;
		
		try{  
			Socket.io = io.connect(Socket.host);
			
			Log.write('<p class="event">Socket Status: '+Socket.io.readyState+'</p>');  
			
			Socket.io.on('connect', function () {
				
				Socket.io.send('connect ' + mServer);
				
				Log.write('<p class="event">Socket Status: '+Socket.io.readyState+' (open)</p>');
				Socket.connected = true;
				
				Socket.io.on('message', function (msg) {
					Log.parseMessage(msg);
				});
			  
				Socket.io.on('close', function() {  
					Socket.connected = false;
					Log.write('<p class="event">Socket Status: '+Socket.io.readyState+' (Closed)</p>');  
				});
			});
		  
		} catch(exception){  
			Log.write('<p>Error'+exception+'</p>');  
		}  
	}, //End connect
	
	close: function() {
		if( Socket.connected )
			Socket.io.close(); 
	},
	
	send: function(msg) {
		if( Socket.connected )
			Socket.io.send(msg+Socket.EOL);
	}
		
};