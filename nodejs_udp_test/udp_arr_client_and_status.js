/*
2019-01-08
Marco Martinez
consumes arr command after ok or err response, also handles udp status message
*/
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const status = dgram.createSocket('udp4');

const port = 8889;

let commands = {
  '192.168.10.1': ['command', 'wifi?', '10000', 'level']
};
let status_data = {
  '192.168.10.1': {}
};


server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});
server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  nextCMD(rinfo.address);
});
server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});
server.bind(port);


//STATUS SERVER
status.on('listening', function () {
    let address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
status.on('message', function (message, remote) {
    //console.log(remote.address + ':' + remote.port +' - ' + message);
    status_data[remote.address] = dataSplit(message.toString());
});
status.bind(8890, '0.0.0.0');

function dataSplit(str){
  let data = {};
  let arrCMD = str.split(';');  
  for(let i in arrCMD){
    let tmp = arrCMD[i].split(':');
    if(tmp.length > 1){
      data[tmp[0]] = tmp[1];
    }
  }
  return data;
}



setTimeout(function () {
  senCMD('192.168.10.1', commands['192.168.10.1'][0]).catch((e) => console.log(e)).then((res) => console.log(res));
}, 3000);
setTimeout(function () {
  server.close();
  server.unref();
}, 10000);



//SEND COMMANDS
function senCMD(tello, command) {
  if (parseInt(command, 0)) {//TIMEOUT
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        nextCMD(tello);
        resolve('OK');
      }, parseInt(command, 0));
    });
  }
  else if(command == 'level'){    
    return new Promise((resolve, reject) => {
      console.log(status_data);
      resolve('OK');
    });
  }
  else if(command == 'close'){
    return new Promise((resolve, reject) => {
      server.close();
      server.unref();
      resolve('OK');
    });
  }
  else{//regular text command
    return new Promise((resolve, reject) => {
      let msg = Buffer.from(command);
      server.send(msg, 0, msg.length, port, tello, function (err) {
        if (err) {
          console.error(err);
          reject(`ERROR : ${command}`);
        } else resolve('OK');
      });
    });
  }
}

function nextCMD(tello) {
  if (commands.hasOwnProperty(tello)) {
    let cmd = commands[tello];
    console.log(cmd)
    if (cmd.length > 1) {
      cmd.shift();
      senCMD(tello, commands[tello][0]);
    } else {
      console.log('ALL CMD SENT');
    }
  } else {
    console.log('Drone Not Found');
  }
}
/*
shift()

*/