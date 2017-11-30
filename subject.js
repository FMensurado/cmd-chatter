const io = require('socket.io-client');
var spawn = require('child_process').spawn;
var parseArgs = require('shell-quote').parse;

// TODO: url should be a command line argument
// cmd-chatter-cmd-chatter.193b.starter-ca-central-1.openshiftapps.com
//var socket = io('http://localhost:3000');
var socket = io('http://cmd-chatter-cmd-chatter.193b.starter-ca-central-1.openshiftapps.com');

var runCommand = function(cmd, res) {
  var ls = spawn('cmd', ['/C'].concat(parseArgs(cmd.replace('\\','\\\\'))));
  var output = '';

  ls.stdout.on('data', (data) => {
    output += data;
  });

  ls.stderr.on('data', (data) => {
    output += data;
  });

  ls.on('close', (code) => {
    res(output);
    console.log("child process exited with code  " + code);
  });
};

// TODO: message name 'teste' should be a command line argument
socket.emit('login', 'teste', (res) => {
  console.log('login status:' + res ? 'ok' : 'error');
  socket.on('teste', (cmd, res) => {
    if (cmd.toLowerCase() !== 'exit') {
      console.log(cmd);
      runCommand(cmd, res);
    } else {
      socket.close();
    }
  });
});
