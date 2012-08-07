var html = require('fs').readFileSync(__dirname+'/chatify.html');
var url = require('url');
var server = require('http').createServer(function(req, res){
/*if(req.method=='GET') {
	var url_parts = url.parse(req.url,true);
	//everyone.now.receiveMessage("Server", curDate(), url_parts.query);
	console.log(url_parts.query);
}*/
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
	var newName = this.now.name;
	var num = 1;
	while(names.indexOf(newName)!=-1) {
		newName = this.now.name+num;
		num++;
	}
	this.now.name = newName;
	everyone.now.updateUserList(newName);
	for (var i = 0; i < names.length; i++) {
		this.now.updateUserList(names[i]);
	}
	names.push(newName);
	
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
	var mins = ""+d.getMinutes();
	if(mins.length==1) mins = "0"+mins;
	
	var secs = ""+d.getSeconds();
	if(secs.length==1) secs = "0"+secs;
	
	var dStr = hours + ":" + mins + ":"+ secs + " " + morn;
	return dStr;
}
