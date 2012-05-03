var express = require('express'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    ejs = require('ejs'), // https://github.com/visionmedia/ejs
    routes = require('./routesConfig'),
    mongoStore = require('connect-mongodb'),
    _ = require("underscore");

var app = module.exports = express.createServer(express.logger());
global.app = app;
var requestURL = require('request');

var DB = require('./accessDB');
var db = new DB.startup(process.env.MONGOLAB_URI);
var secret = process.env.SALT;

/*********** SERVER CONFIGURATION *****************/
app.configure(function() {
    app.register('html', require('ejs'));
    app.set('views',__dirname+ '/views');
    app.set('view engine','ejs');
    app.use(express.static(__dirname + '/static')); // set static dir for flat files
    app.set('view options', {layout: true});
    //app.locals.layout = 'layout.html';
    app.use(express.bodyParser());
    app.use(express.logger());
    app.use(express.cookieParser(secret)); //Cookies must be turned on for Sessions
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.methodOverride());

    app.use(express.session({ 
            store: mongoStore({url:process.env.MONGOLAB_URI}),
            secret: secret
        }, function() {
            app.use(app.router);
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
});

require('./routesConfig')(app);

// Make server turn on and listen at defined PORT (or port 3000 if is not defined).
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

// tinyphone code w/ socket.io courtesy of Chris Kairalla & ITP Redial

var REMOTE_PORT=12002;
var SOCKETIO_PORT=12003;
var AGI_HOST = '127.0.0.1';
var AGI_PORT = 12001;

var agi_net = require('net');
var remote_net = require('net');
var io = require('socket.io').listen(SOCKETIO_PORT);

//set up socket.io
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging
/**
 * The very simple protocol has 3 attributes:
 * id = unique id for call
 * event = event name
 * value = depends on event type.
 * three attributes are comma delimted, name and value are colon delimited.
 * message is CR delimited.
 * There are 4 event types- new_call, keypress, audio_level, and hangup:
 * id:133238984.24,event:new_call,value:16466429290
 * id:133238984.24,event:keypress,value:*
 * id:133238984.24,event:audio_level,value:56
 * id:133238984.24,event:hangup,value:0
*/

/**
 *Remote clients can only receive data.
 * The only event that they can send is a CONNECT message
 * Message has 4 attributes: CONNECT,a unique ID, phone number,NULL or CR.
 * The NULL/CR attribute sets the "stop byte" for messages sent to client.
 * CONNECT,UNIQUEID123456,16468385747,NULL
 */
var agiBuffer = "";
var remoteBuffer="";
var callers = {};
//remote screens or physical objects
var remoteClients = {};
//remote screens or physical objects
//var webClients = {};
remote_net.createServer(function(sock){
  sock.setEncoding('ascii');
  console.log('CONNECTED REMOTE CLIENT: ' + sock.remoteAddress +':'+ sock.remotePort);
      // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        var remoteKey = sock.remoteAddress+":"+sock.remotePort;
        delete remoteClients[remoteKey];
        console.log('CLOSED REMOTE CLIENT: ' + remoteKey);
    });
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        for ( var i = 0; i < data.length; i++){
            //handle cr or null terminated byte
            if (data.charAt(i) == '\n' || data.charAt(i) == '\0'){
                handleMessage(remoteBuffer);
                remoteBuffer = "";
            } else {
                remoteBuffer = remoteBuffer + data.charAt(i);   
            }
        }
        function handleMessage(buf){
            var attr = buf.split(',');
            if (attr.length != 4 || attr[0] != "CONNECT"){
                console.log("malformed message from remote client: "+buf);
             return;   
            }
            var phone_number = attr[2];
            var uniqueid=attr[1];
            var term_byte = '\n';
            if (attr[3] == "NULL"){
                term_byte = '\0';
            }
            var remoteClient = { id : uniqueid,
                                 phoneNumber : phone_number, 
                                 termByte : term_byte
                                }
            remoteClient["socket"]=sock;
            var remoteKey = sock.remoteAddress+":"+sock.remotePort;
            remoteClients[remoteKey] = remoteClient;
         console.log(buf);   
        }
        
    });
}).listen(REMOTE_PORT);
console.log('Server listening for remote connections on ' + REMOTE_PORT);

agi_net.createServer(function(sock) {
    sock.setEncoding('ascii');
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED AGI CLIENT: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        for ( var i = 0; i < data.length; i++){
            if (data.charAt(i) == '\n'){
                handleMessage(agiBuffer);
                agiBuffer = "";
            } else {
                agiBuffer = agiBuffer + data.charAt(i);   
            }
        }
        
        function handleMessage (buf){
            var attr = buf.split(',');
            var message = {};
            for (var i = 0; i < attr.length; i++){
                   var nameValue = attr[i].split(':');
                   message[nameValue[0]] = nameValue[1];
            }
            switch(message.event){
             case "new_call": newCaller(message); break;
             case "keypress": keyPress(message); break;
             case "audio_level": audioLevel(message); break;
             case "hangup": hangup(message); break;
             default: console.log('UNKNOWN MESSAGE: ' + JSON.stringify(message)); break;
            }
            //console.log('DATA ' + sock.remoteAddress + ': ' + JSON.stringify(message));
        }
        
        function newCaller(message){
            var phoneNumbers=message.value.split("|");
            var caller = {  id : message.id,
                            callerNumber : phoneNumbers[0],
                            numCalled : phoneNumbers[1] };
            console.log("new caller! " + JSON.stringify(caller));
            caller["socket"] = sock;
            callers[caller.id]=caller;
            message.value = phoneNumbers[0];
            sendRemote(message,message.id);
        }
        
        function keyPress(message){
            sendRemote(message,message.id);
            //console.log("key press! " + JSON.stringify(message));   
        }
        
        function audioLevel(message){
            sendRemote(message,message.id);
            //console.log("audio level! " + JSON.stringify(message));   
        }
        
        function hangup(message){
            var caller = callers[message.id];
            caller.socket.destroy();
            sendRemote(message,message.id);
            delete callers[message.id];
            //console.log("hangup! " + JSON.stringify(message));
        }
        
        function sendRemote(message, caller_uid){
            var msgString = JSON.stringify(message);
            var caller = callers[caller_uid];
          //send net clients
            for (key in remoteClients){
                var remoteClient = remoteClients[key];
                if (caller.numCalled == remoteClient.phoneNumber){
                    remoteClient.socket.write(msgString+remoteClient.termByte);
                }
            }
            //send socket.io clients
            io.sockets.clients().forEach(function (socket) { 
                socket.get('phoneNumber', function (err, phoneNumber) {
                    if(phoneNumber == caller.numCalled){
                        if (message.event == 'audio_level'){
                            socket.volatile.emit(message.event,message);
                        } else {
                            socket.emit(message.event,message);
                        }
                    } else {
                     console.log("unknown screen for number "+caller.numCalled);   
                    }
                });
            });
        //io.sockets.emit(message.event, message);
        }
        
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED AGI CLIENT: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(AGI_PORT, AGI_HOST);
//set up socket.io
io.sockets.on('connection', function (socket) {
  socket.on('setup', function(info) {
      socket.set('phoneNumber', info.phoneNumber, function () {});
      socket.set('id', info.id, function () {});
    console.log("just got setup info: "+JSON.stringify(info));
  });
  socket.on('disconnect', function() {
    console.log("socket.io client disconnected");
  });
});

console.log('Server listening for AGI connections on ' + AGI_HOST +':'+ AGI_PORT);