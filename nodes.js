

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  ,	redis = require("redis");

app.listen(9374);



var Message = function (message, group, channel, context, client, messageId) {
	// The group or controller group the message will direct to.
	this.group = group || "";
	// Message is the data object being moved around.
	this.message = message || {};
	// The channel is the secondary label used to direct the flow of the message.
	this.channel = channel || "";
	// The client that transmited the message.
	this.client = client || {};
	// The context the message should be replied to.
	this.context = context || "";
	
	this.messageId = messageId || Math.floor(new Date()*Math.random());
};


function handler (req, res) {
  fs.readFile('AsynSocketClient.html',
  function (err, data) {
    if (err) {
		res.writeHeader(500, {"Content-Type": "text/html"});
		return res.end('Error loading AsyncSocketClient.html');
    }

    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(data);
  });
}



var model = {
	broadCastMessages: {}
};



var client = redis.createClient(null, "copybyte.com");
var otherClient = redis.createClient(null, "copybyte.com");  
  
  
io.sockets.on('connection', function (socket) {
	
	client.on("message", function (channel, message) {
		// console.log("Message recieved from redis: " + channel + " : " + JSON.stringify(message));
		var obj = JSON.parse(message);
		try {
			if (!model.broadCastMessages[obj.messageId]) {
				var formalMessage = new Message(obj.message, (obj.group || channel), obj.channel, obj.context, {});
				model.broadCastMessages[formalMessage.messageId] = true;
			
				// console.log("Forwarding message from redis: " + channel + " : " + JSON.stringify(formalMessage));
				socket.emit(channel, formalMessage);
			
				model.broadCastMessages[obj.messageId] = true;
			}
		}
		catch (e) {
			console.log("Unable to forward message.");
		}
		// client.publish(channel, message);
	});
		
	socket.on("register handler", function (message) {
		console.log("Registering handler for: " + message.group);
		client.subscribe(message.group);
		
		socket.on(message.group, function (socketMessage) {
			try {
				var formalMessage = new Message(socketMessage.message, message.group, socketMessage.channel, socketMessage.context, {});
				model.broadCastMessages[formalMessage.messageId] = true;
			}
			catch (e) {
				console.log(e);
			}
			
			otherClient.publish(message.group, JSON.stringify(formalMessage));
			// var logMessage = "Message recieved on " + message.group + " from " + socketMessage.context + " stating: " + JSON.stringify(socketMessage);
			// console.log(logMessage);
			if (socketMessage.context) {
				// client.publish(socketMessage.context, logMessage);
				// socket.emit(socketMessage.context, logMessage);
			}
		});
	});
	
	
	

	
});  