// var http = require('http'),  
// io = require('socket.io'),
// fs = require('fs');
// 
// // respcont = fs.readFileSync('/AsyncSocketClient.html');
// var server;
// fs.readFile('AsynSocketClient.html', function (err, html) {
//     if (err) {
//         throw err; 
//     }       
//     server = http.createServer(function(request, response) {  
//         response.writeHeader(200, {"Content-Type": "text/html"});  
//         response.write(html);  
//         response.end();  
//     }).listen(9374);
// 	
// 	// socket.io 
// 	var socket = io.listen(server);
// 	socket.on('connection', function(client){ 
// 	  // new client is here! 
// 	    client.on('message', function(){ console.log('message arrived'); }) 
// 	    client.on('disconnect', function(){ console.log('disconnected'); }) 
// 	});
// });
// 
// // server = http.createServer(function(req, res){ 
// //  // your normal server code 
// //     res.writeHead(200, {'Content-Type': 'text/html'}); 
// //     // res.end();
// // 	    // res.end(respcont);
// // });
// 
// 
// 
// // server.listen(9374);
// 


 // if you'd like to select database 3, instead of 0 (default), call
 // client.select(3, function() { /* ... */ });




var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  ,	redis = require("redis");

app.listen(9374);







var window = this;


(function (className, namespace) {
	if (typeof namespace == 'string' && !window[namespace]) {
		window[namespace] = {};
	}
	else if (typeof namespace == 'string' && window[namespace] && typeof className == 'string' && window[namespace][className]) {
		return;
	}
	namespace = namespace || 'window';
	/**
	 * Message controller constructor.
	 * @returns {MessageController} instance
	 */
	var MessageController = function () {
		/**
		 * Object to store the message handlers.
		 * @property
		 */
		this.messagePool = {};
		/**
		 * Unique ID counter
		 * @property
		 */
		this.currentUID = 0;
	};
	/**
	 * Prototype of the MessageController class
	 * @prototype
	 */
	MessageController.prototype = {
		/**
		 * Add an event listener
		 * @param {String} group Listener group to add the callback to.
		 * @param {Function} callback callback to register to a listener group.
		 */
		addListener: function (group, callback) {
			this.currentUID += 1;
			var listener = {
				group: group,
				UID: this.currentUID,
				sendMessage: (function (that) {
					return function (message, channel) {
						console.log(message);
						return that.sendMessage(this.group, message, channel);
					};
				})(this),
				destroy: (function (that) {
					return function () {
						return that.removeListener(this);
					};
				})(this)
			};

			this.messagePool[group] = this.messagePool[group] || {};
			this.messagePool[group][listener.UID] = callback;
			return listener;
		},
		/**
		 * Remove a registered callback
		 * @param {Listener} listener Listener resource object
		 */
		removeListener: function (listener) {
			try {
				delete this.messagePool[listener.group][listener.UID];
			}
			catch (e) {}
		},
		/**
		 * Send a message to a listener group.
		 * @param {String} group Listener group reference by name
		 * @param {Any} message Message to be send to the specified listener group
		 * @param {String} channel Message channel to allow listener callback to filter messages
		 * targeted at specific listeners.
		 */
		sendMessage: function (group, message, channel) {
			var messageGroup = this.messagePool[group],
			exceptions = [];
			for (callback in messageGroup) {
				if (messageGroup.hasOwnProperty(callback)) {
					try {
						messageGroup[callback](message, channel);
					}
					catch (e) {
						exceptions.push({
							message: 'Callback failed for' + callback,
							exception: e
						});
					}
				}
			}
			return exceptions;
		}
	};

	window[namespace][className] = new MessageController();

})('MessageController', 'Foundation');











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

io.sockets.on('connection', function (socket) {

	// aspectClient.subscribe("entity-builder-property");
	// socket.on("entity-builder-property", function (data) {
	// 	console.log("a;sdfasdf");
	// 
	// });
  // socket.on("register handler", function (data) {
  // 	  socket.on(data.group, function (msg) {
  // 		  socket.emit(data.group, msg);
  // 	  });
  // });
  var client = redis.createClient(null, "copybyte.com")
  , aspectClient = redis.createClient(null, "copybyte.com");

  client.on("error", function (err) {
      console.log("Error " + err);
  });
  
  aspectClient.on("error", function (err) {
	  console.log("Error " + err);
  })
	var $handle = function (group) {
		socket.emit("register handler", {group:group});
		aspectClient.subscribe(group);
		return {
			with: function (action) {
				if (undefined == group) {
					throw new Error("A group identifier must be provided when handling a socket message.");
					return;
				}
				// console.log("Registering socket handlers for group: " + group);
				// client.subscribe(group);
				client.publish("register handler", JSON.stringify({group:group}));
				socket.on(group, function (data) {
					// console.log("A message was recieved on the socket for group: " + group);
					action(data);
				});
			}
		}
	}
	
	// Select the group to broadcast a message to.
	var $to = function (group) {
		return {
			// Broadcast a message to attached clients.
			say: function (msg) {

				// console.log("Publishing to the group: " + group + " a message:" + JSON.stringify(msg));
				// Emit the message into the redis publisher interface.
				// console.log("Emitting the message into the redis publisher interface.");
				redis.createClient(null, "copybyte.com").publish(group, JSON.stringify(msg));
				// Emit the message into the socket.
				// console.log("Emitting the message into the socket.");
				socket.emit(group, msg);
			}
		}
	}
	
	var AccountController = {
		interface: function (request) {
			if (request.channel == "as a user i would like to login") {
				$to("logger").say("A user would like to login. Validating account.");
			}
		}
	}


	// Redis client recieved a message.
	client.on("message", function (channel, message) {

		var obj = JSON.parse(message);
		
		// Confirm we recieved the message.
		if (obj.context) {
			$handle(obj.context).with(function(data) {
				// console.log("Callback message recieved");
				// console.log(data);
				$to(obj.context).say(data);
			});
			client.subscribe(obj.context);
			
		}
	});
	
	// Redis registered a new subscriber.
	client.on("subscribe", function (channel, count) {
		// console.log("Subscribe to channel: " + channel);
		// console.log("Count: #" + count);
	});
	
	
	
	$handle("register handler").with(function (data) {
		// client.subscribe(data.group);
		// console.log("Subscribing to: " + data.group);
		$to("logger").say("The AspectSocket has connected to the group: " + data.group);
		$to(data.group).say({handlerRegistered:true, data:data});
		
		$handle(data.group).with(function (msg) {
			// console.log("Publishing message to redis and socket. Handle");
			$to(data.group).say(msg);
		});
		socket.on(data.group, function (msg) {
			// console.log("Publishing message to redis and socket.");
			//redis.createClient().publish(data.group, JSON.stringify(msg));
			//socket.emit(data.group, msg);
			$to(data.group).say(msg);
	  	});
    });

  
	// $handle("ping").with(function (data) {
	// 	$to("pong").say(data);
	//     });
	
	$handle("account-controller").with(AccountController.interface);
  	
	
  
  
});