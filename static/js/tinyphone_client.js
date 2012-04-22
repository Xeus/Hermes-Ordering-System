(function(){

//BEGINNING OF SCRIPT (INIT)
	//set namespace
  tinyphone = {};
  // Set version
  tinyphone.version = "tinyphone.js 0.0.1";
  tinyphone.callers = {};
  tinyphone.uniqueID = new Date().getTime()+"."+Math.random();
  tinyphone.callback = {};
  
  tinyphone.init = function(host, port, phoneNumber){
  	phoneNumber = phoneNumber.replace(/[\(\s\)+-]/g,"");
  	tinyphone.socketioLocation = "http://"+host+":"+port;
	tinyphone.socketioSrc="http://"+host+":"+port+"/socket.io/socket.io.js";
	tinyphone.phoneNumber = phoneNumber;
	tinyphone.loadSocketIO();
  }
  
// Load SocketIO
  tinyphone.loadSocketIO = function () {
    var head   = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = tinyphone.socketioSrc;
  	var socketIOLoaded = false;
    script.onload = script.onreadystatechange = function () {
      if (!socketIOLoaded && (!this.readyState ||
                       this.readyState === "loaded" ||
                       this.readyState === "complete")) {
        socketIOLoaded = true;
        // Delay invocation of init() so that the parent script has an 
        // opportunity to define megaphone.onControllerLoaded() before init() runs
        setTimeout(initSocketIO, 0);
      };
    };
    head.appendChild( script, head.firstChild );
  }
tinyphone.on = function(callback,callbackFunction){
	tinyphone.callback[callback]=callbackFunction;
}
function initSocketIO(){
var socket = io.connect(tinyphone.socketioLocation);
socket.on('connect', function(){
	//console.log('connected to server');
	socket.emit("setup",{"id":tinyphone.uniqueID,"phoneNumber":tinyphone.phoneNumber});
	var callback = tinyphone.callback['connect'];
	if (callback){
		callback();
	}
});
socket.on('new_call', function(msg){
	var caller = {"id":msg.id, callerNumber:msg.value};
	tinyphone.callers[caller.id]=caller;
	//console.log('received a new call! '+JSON.stringify(caller));
	var callback = tinyphone.callback['new_call'];
	if (callback){
		callback(caller);
	}
});
socket.on('keypress', function(msg){ 
	//console.log('received keypress '+keypress+' from '+caller.callerNumber);
	var callback = tinyphone.callback['keypress'];
	if (callback){
		var caller = tinyphone.callers[msg.id];
		var keypress = msg.value;
		caller.keypress = keypress;
		callback(caller);
	}
});
socket.on('audio_level', function(msg){ 
	var callback = tinyphone.callback['audio_level'];
	if (callback){
		var caller = tinyphone.callers[msg.id];
		var audioLevel = msg.value;
		caller.audioLevel = parseFloat(audioLevel)/32768;
		callback(caller);
	}
	//console.log('received audio '+audioLevel+' from '+caller.callerNumber);
});
socket.on('hangup', function(msg){ 
	var caller = tinyphone.callers[msg.id];
	delete tinyphone.callers[msg.id];
	var callback = tinyphone.callback['hangup'];
	if (callback){
		callback(caller);
	}
});
socket.on('disconnect', function(){ 
var callback = tinyphone.callback['disconnect'];
	if (callback){
		callback();
	}
}) ;
}
})();