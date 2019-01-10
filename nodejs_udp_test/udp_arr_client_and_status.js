/*
2019-01-08
Marco Martinez
consumes arr command after ok or err response, also handles udp status message


COMMANDS FORMAT
let commands = {
  '192.168.10.1': {
    cmd_list : ['command', 'wifi?', '5000', 'level'],
    status: {}
  },
  'second_drone_ip': {
    cmd_list : ['command'],
    status: {}
  }
};



*/
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const status = dgram.createSocket('udp4');

const port = 8889;
const port_status = 8890;
const level_height = 110;

let commands = {
  '192.168.10.1': {
    cmd_list : ['command', 'wifi?', '5000', 'level'],
    status: {}
  }
};

async function startCMD(){
  let arr = Object.keys(commands);
  for(let i in arr){
    await senCMD(arr[i], commands[arr[i]]['cmd_list'][0]).catch((e) => console.log(e)).then((res) => console.log(res));
  }
  return 'OK';
}

setTimeout(function () {
  startCMD();
}, 3000);
setTimeout(function () {
  server.close();
  server.unref();
}, 12000);
setInterval(function(){
  //console.log(commands['192.168.10.1']['status'])
}, 1000);



//CLIENT SERVER
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
  console.log(`UDP STATUS SERVER - ${address.address}:${address.port}`);
});
server.bind(port);
//STATUS SERVER
status.on('listening', function () {
    let address = status.address();
    console.log(`UDP STATUS SERVER - ${address.address}:${address.port}`);
});
status.on('message', function (message, remote) {
    //console.log(remote.address + ':' + remote.port +' - ' + message);
    commands[remote.address]['status'] = dataSplit(message.toString());
});
status.bind(port_status);




//UDP FUNCTIONS
function dataSplit(str){//Create JSON OBJ from String  "key:value;"
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
//SEND COMMANDS
function senCMD(tello, command) {//SEND COMMAND TO TELLO OR SPECIAL FUNCTIONS
  if (parseInt(command, 0)) {//WAIT TIMMER FUNCTION
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        nextCMD(tello);
        resolve('OK');
      }, parseInt(command, 0));
    });
  }
  else if(command == 'level'){// SET DRONE TO DESIRE LEVEL, CHECK CURRENT HEIGHT ANS SEND COMMAND TO MACH
    return new Promise((resolve, reject) => {
      let msg = null;
      let h =  parseInt(commands[tello]['status']['h'], 0);
      if(h < level_height){
        msg = Buffer.from(`up ${level_height - h}`);
        console.log(`up ${level_height - h}`)
      }
      else if(h > level_height){
        msg = Buffer.from(`down ${h - level_height}`);
        console.log(`down ${h - level_height}`)
      }
      else{
        msg = Buffer.from('wifi?');
      }      
      server.send(msg, 0, msg.length, port, tello, function (err) {
        if (err) {
          console.error(err);
          reject(`ERROR : ${command}`);
        } else resolve('OK');
      });
    });
  }
  else if(command == 'close'){//CLOSE UDP CONNECTION
    return new Promise((resolve, reject) => {
      server.close();
      server.unref();
      resolve('OK');
    });
  }
  else{//DEFAULT - SEND COMMAND TO TELLO DRONE
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
function nextCMD(tello) {//GET NEXT COMMAND IN LINE
  if (commands.hasOwnProperty(tello)) {
    let cmd = commands[tello]['cmd_list'];
    if (cmd.length > 1) {
      cmd.shift();
      senCMD(tello, commands[tello]['cmd_list'][0]);
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