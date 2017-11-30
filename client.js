const io = require('socket.io-client');
const readline = require('readline');
const Promise = require('promise');

var socket = io('http://localhost:3000');
var clientName;

var getCmd = () => {
  var p = new Promise((resolve, reject) => {  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('> ', (cmd) => {
      resolve(cmd);
      rl.close();
    });
  });
  
  return p;
}

var keepChatting = (name) => {
  getCmd().then((cmd) => {
    if(cmd !== 'exit') {
      socket.emit(name, cmd);
    } else {
      socket.close();
    }
  });
}

socket.emit('client', 'teste', (name) => {
  if(name) {
    clientName = name;
    console.log('name = ' + clientName);

    socket.on(clientName, (output) => {
      console.log(output);
      keepChatting(clientName);
    });

    keepChatting(clientName);
  } else {
    console.log('Error connecting to ' + 'teste');
    socket.close();
  }
});
