var clients = [];
var io  = require("./socket.io").listen(8081);
var net = require("net");


io.sockets.on('connection', function (client) {

	var is_connected = false;
	var taps;
	
	clients.push(client);
	
	console.log("Number of clients: " + clients.length);
	
	client.on('message', function (data) {
		if( is_connected )
			taps.write(data);
		else {
			var m;
			console.log('Incoming: ' + data);
			if(m = data.match(/^connect ([^:]*):(.*)$/) ) {
				console.log('Attempting connection to '+m[1]+':'+m[2]);
				taps = net.createConnection(m[2], m[1]);
				taps.setEncoding('utf8');				    
				taps.on('data', function(data) { client.send(data); });
				taps.on('connect', function() {
					console.log("Connected to remote server");
					is_connected = true;
				});
				taps.on('end', function() {
			    	is_connected = false;
			    	console.log('Server disconnected')
				});
			}			
		}
	});
	
	client.on('disconnect', function () {
		var i = clients.indexOf(client);
		if(is_connected) taps.end();
		clients.splice(i, 1);
	  
		console.log('Disconnected websocket leaving ' + clients.length);
  });
});


var http = require('http');
var fs = require('fs');
var path = require('path');
 
http.createServer(function (request, response) {
 
    console.log('request starting...');
     
    var filePath = '../client' + request.url;
    if (request.url == '/')
        filePath += '/index.html';
    
    var m;
    if( m = filePath.match(/^([^\?]*)\?/) )
    	filePath = m[1];
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.ttf':
            contentType = 'font/ttf';
            break;
        case '.ico':
        	contentType = 'image/vnd.microsoft.icon';
        	break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
}).listen(8125);
 
console.log('Server running at http://127.0.0.1:8125/');

console.log("Listening to port 8081");