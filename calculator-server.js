// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

process.title = 'sezzle-calculator';

var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

// latest 10 calulations
var history = [];
// current users
var clients = [];

//Helper function for escaping input strings
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];


// HTTP server
var server = http.createServer(function(request, response) {
    
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});


// WebSocket server
var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin); 
    var index = clients.push(connection) - 1;
    var currColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send prev calculations
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    //a calculation is completed
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            currColor = colors[Math.floor(Math.random() * (colors.length-1))];
            var obj = {
                text: htmlEntities(message.utf8Data),
                color: currColor
            };
            history.push(obj);
            history = history.slice(-10);

            // broadcast prev calculations to all connected clients
            var json = JSON.stringify({ type:'message', data: obj });
            for (var i=0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
          
        }
    });

    // connection closed
    connection.on('close', function(connection) {
        console.log("Connection closed!")
    });

});