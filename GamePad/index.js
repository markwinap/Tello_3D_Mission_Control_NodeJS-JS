
const WebSocket = require('ws');//WEBSOCKET
const port_websocket = 8080;//WEBSOCKET PORT


const deathZone = 0.099;//FILTER FOR AXIS
const controllerType = 'xbox_1';//Select Your Cntroller
const controller = {//Controller mapping
    xbox_1 : {
        axis: {//rc a b c d
            0: {d: 1},// - 1 to invert result
            1: {c: 1},
            2: {a: 1},
            3: {b: 1}
        },
        button: {
            0: 'flip b',
            1: 'flip r',
            2: 'flip l',
            3: 'flip f',
            4: 'land',
            5: 'takeoff',
            6: 'emergency',
            7: 'emergency',
            8: 'command',
            9: 'command',
            10: 'emergency',
            11: 'emergency',
            12: 'flip f',
            13: 'flip b',
            14: 'flip l',
            15: 'flip r',
            16: 'emergency',
        },
        button_exclude : [],
        axis_exclude : [4, 5]
    },
    ps4 : {
        axis: {
            0: {b: -1},// - 1 to invert result
            1: {a: 1},
            2: {c: -1},
            3: {d: 1}
        },
        button: {
            4: 'command',
            5: 'command',
            0: 'flip l',
            1: 'flip b',
            2: 'flip r',
            3: 'flip f',
            6: 'command',
            7: 'command',
            8: 'takeoff',
            9: 'land',
            10: 'emergency',
            11: 'emergency',
            12: 'command',
            13: 'command',
        },
        button_exclude : [],
        axis_exclude : [4, 5, 6, 7]
    }
};
let temp_input = '';










//###WEBSOCKET### SERVER
let websocket = new WebSocket.Server({ port: port_websocket });
websocket.on('connection', function connection(websocket) {
    console.log('Socket connected. sending data...');
    websocket.on('error', function error(error) {
        console.log('WebSocket error');
    });
    websocket.on('message', function incoming(msg) {
        let obj = JSON.parse(msg);
        let cmd;        
        cmd = getButton(obj.buttons) ? getButton(obj.buttons) : getAxes(obj.axes);
        if(cmd != temp_input){
            temp_input = cmd;
            websocket.send(cmd);
        }
        //console.log('received: %s', msg);

        
    });
    websocket.on('close', function close(msg) {
        console.log('WebSocket close');
    });
});

function getButton(arr){
    let button = null;
    for(let i in arr){
        if(arr[i]) button = i;
    }
    return controller[controllerType].button[button];
}
function getAxes(arr){
    let obj = {a: 0, b: 0, c: 0, d: 0};
    for(let i in arr){
        let key = Object.keys(controller[controllerType].axis[i]);//{d: 1}
        let val = 0;
        if(arr[i] < deathZone && arr[i] > (deathZone * -1)){
            val = 0;
        }
        else{
            console.log(arr[i])
            val = arr[i];
        }
        obj[key] = parseInt((val * 100) * controller[controllerType].axis[i][key], 0);
        console.log(obj)    
    }
    return `rc ${obj.a} ${obj.b} ${obj.c} ${obj.d}`;    
}




function getRC(axis, axis_map){
    let obj = {a: 0, b: 0, c: 0, d: 0};
    let axis_arr = Object.keys(axis);//{ '0': false, '1': false, '2': false, '3': false }
    for(let i in axis_arr){
        let temp = Object.keys(axis_map[axis_arr[i]]);//{d: 1}
        obj[temp[0]] = axis[axis_arr[i]] ? parseInt((axis[axis_arr[i]] * 100) * axis_map[axis_arr[i]][temp[0]], 0) : 0;        
    }
    return `rc ${obj.a} ${obj.b} ${obj.c} ${obj.d}`;    
  }