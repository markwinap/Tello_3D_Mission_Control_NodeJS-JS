/*
2019-01-08
Marco Martinez
Test for UDP Status Message
*/

const PORT = 8890;
const HOST = '0.0.0.0';

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('listening', function () {
    let address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    //console.log(remote.address + ':' + remote.port +' - ' + message);
    let test = dataSplit(message.toString());
    console.log(`H: ${test.h} - TOF: ${test.tof} - X: ${test.x} - Y: ${test.y} - Z: ${test.z}`);

});

server.bind(PORT, HOST);



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

/*
{ mid: '257',
  x: '0', Forward +20, Backward-20
  y: '0',
  z: '0',
  mpry: '0,0,0',
  pitch: '0',
  roll: '0',
  yaw: '0',
  vgx: '0',
  vgy: '0',
  vgz: '0',
  templ: '70',
  temph: '73',
  tof: '10',
  h: '0', 80 takeoff / 
  bat: '91',
  baro: '1674.08',
  time: '16',
  agx: '9.00',
  agy: '-1.00',
  agz: '-999.00' }

*/