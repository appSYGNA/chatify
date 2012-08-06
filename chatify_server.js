var html = require('fs').readFileSync(__dirname+'/chatify.html');
var server = require('http').createServer(function(req, res){
  res.end(html);
});
server.listen(80);

var nowjs = require("now");
var everyone = nowjs.initialize(server);

var names = []; //Active users
var log = []; //Chat history
//Keep 50 lines of chat

everyone.now.distributeMessage = function(message){
	var date = curDate();
	var data = {"date":date, "name":this.now.name, "message":message};
	log.push(data); //Add to history
	if(log.length > 50) log.splice(0, 1); //Ensure that there are only 50 lines kept in the history
	everyone.now.receiveMessage(this.now.name, date, message);
};

nowjs.on('connect', function(){
	//Update user list
	everyone.now.updateUserList(this.now.name);
	for (var i = 0; i < names.length; i++) {
		this.now.updateUserList(names[i]);
	}
	names.push(this.now.name);
	
	//Send user some chat history
	this.now.receiveHistory(log);
});
 
nowjs.on('disconnect', function(){
	var index = names.indexOf(this.now.name);
	names.splice(index, 1);
	everyone.now.removeUser(this.now.name); 
});

function curDate(){
	var d = new Date();
	var morn = "AM";
	var hours = d.getHours();
	if(hours>12) {
		morn = "PM";
		hours-=12;
	}
	var dStr = hours + ":" + d.getMinutes() + ":"+d.getSeconds() + " " + morn;
	return dStr;
}
