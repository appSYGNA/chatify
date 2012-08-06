var html = require('fs').readFileSync(__dirname+'/chatify.html');
var server = require('http').createServer(function(req, res){
  res.end(html);
});
server.listen(8080);

var nowjs = require("now");
var everyone = nowjs.initialize(server);
var names = [];

everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};

nowjs.on('connect', function(){

	everyone.now.updateUserList(this.now.name);
	for (var i = 0; i < names.length; i++) {
		this.now.updateUserList(names[i]);
	}
	names.push(this.now.name);
 });
 
 nowjs.on('disconnect', function(){
	var index = names.indexOf(this.now.name);
	names.splice(index, 1);
	everyone.now.removeUser(this.now.name); 
 });
