// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var url = require('url');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
httpServer.listen(7000);

var clientCount = 0;


function requestHandler(req, res) {
    // Read index.html
    var parsedUrl = url.parse(req.url);

    var path = parsedUrl.pathname;
    if (path == "/") {
        console.log('index?');
        path = "/index.html";
    }

    fs.readFile(__dirname + path,

        // Callback function for reading
        function(err, fileContents) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + req.url);
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200);
            res.end(fileContents);
        }
    );

    // Send a log message to the console
    console.log("Got a request " + req.url);
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function(socket) {

        console.log("We have a new client: " + socket.id);

        // When this user emits, client side: socket.emit('otherevent',some data);
        socket.on('chatmessage', function(data) {
            // Data comes in as whatever was sent, including objects
            console.log("Received: 'chatmessage' " + data);

            // Send it to all of the clients
            socket.broadcast.emit('chatmessage', data);
            
            fs.writeFile('message.txt', data, function(err) {
                if (err) throw err;
                console.log('It\'s saved!');
            });

        });

        clientCount++; //when a user connects, add to the number of total users in the room

        //send each user their own ID
        io.to(socket.id).emit('myID', socket.id);

        //send the number of clients online to everyone
        io.sockets.emit('clientCounter', clientCount);


        socket.on('disconnect', function() {
            clientCount--;



            console.log("Client has disconnected " + socket.id);
            io.sockets.emit('clientCounter', clientCount);
            console.log(clientCount);

        });
    }


);
