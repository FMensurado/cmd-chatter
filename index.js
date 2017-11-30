var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuidv4 = require('uuid/v4');

var spawn = require('child_process').spawn;
var subjects = [];
var clients = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat msg', (msg) => {
    console.log(msg);
    io.emit('chat msg', ' > received ' + msg);
  });

  socket.on('login', (subjectName, res) => {
    console.log('logging in ' + subjectName);

    // TODO: check if name is valid
    subjects.push({
      socket: socket,
      subjectName: subjectName
    });
    
    socket.on('disconnect', () => {
      var sj = subjects.find(s => s.socket === socket);
      if(sj) {
        subjects = subjects.filter(s => s.socket !== socket);
      }
    });

    res(true);
  });

  socket.on('client', (subjectName, res) => {
    var sj = subjects.find(s => s.subjectName === subjectName);
    
    if(sj) {
      
      var clientName = uuidv4();
      clients.push({
        socket: socket,
        clientName: clientName
      });
      
      socket.on(clientName, (cmd) => {
        console.log(clientName + ': ' + cmd);
        sj.socket.emit(sj.subjectName, cmd, (output) => {
          socket.emit(clientName, output);
        });
      });
      
      socket.on('disconnect', () => {
        var cl = clients.find(c => c.socket === socket);
        if(cl) {
          clients = clients.filter(c => c.socket !== socket);
        }
      });
      
      res(clientName);
    } else {
      res(null);
    }
  });
});

console.log(process.env);
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

http.listen(port, ipaddress, function(){
  console.log('listening on ' + ipaddress + ':' + port);
});
