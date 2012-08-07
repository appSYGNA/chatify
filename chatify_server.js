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

var groups = {1:{names:[], log:[], group: nowjs.getGroup(1+"")}};
//var names = []; //Active users
//var log = []; //Chat history
//Keep 50 lines of chat

everyone.now.distributeMessage = function(message){
	var date = curDate();
	var data = {"date":date, "name":this.now.name, "message":message, "type":"msg"};
	
	var log = groups[this.now.group].log;
	var group = groups[this.now.group].group;
	log.push(data); //Add to history
	if(log.length > 50) log.splice(0, 1); //Ensure that there are only 50 lines kept in the history
	
	group.now.receiveMessage(this.now.name, date, message);
};

nowjs.on('connect', function(){
	//Update user list
	var newName = this.now.name;
	if(newName=="" || newName==null) {
		newName="Guest";
		this.now.name="Guest";
	} 
	if(!(this.now.group in groups)) groups[this.now.group] = {names:[], log:[], group: nowjs.getGroup(this.now.group+"")};
	
	var names = groups[this.now.group].names;
	var log = groups[this.now.group].log;
	var group = groups[this.now.group].group;
	var num = 1;
	while(names.indexOf(newName)!=-1) {
		newName = this.now.name+num;
		num++;
	}
	this.now.name = newName;
	this.now.changeName(newName);
	
	var date=curDate();

	group.now.announceUser(newName, date);
	group.addUser(this.user.clientId);

	names.push(newName);
	this.now.listAllUsers(names);
	
	//Send user some chat history
	this.now.receiveHistory(log);
	

	log.push({"date":date, "name":this.now.name, "message":"", "type":"connect"});
});
 
nowjs.on('disconnect', function(){
	var date=curDate();
		
	var index = groups[this.now.group].names.indexOf(this.now.name);
	groups[this.now.group].names.splice(index, 1);
	groups[this.now.group].group.now.removeUser(this.now.name, date);
	
	groups[this.now.group].log.push({"date":date, "name":this.now.name, "message":"", "type":"disconnect"});
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
