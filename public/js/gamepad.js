let gamepad;//GamePad Object (Buttons, Axes and Rumble)
let buttons = [];//Hold Buttons Array
let axes = [];//Hold Axes Array
const main_interval = 200;//MS TO Get GamePad Inputs and send them  over WS
const socketURL = 'ws://localhost:8080';// WS Server
let ws;
let ws_autoconnect;
let main_loop;
let ws_connected = false;
window.onload = function () {
    wsConnect();
}
function wsConnect(){
    ws = new WebSocket(socketURL);
    console.log(ws)
    ws.addEventListener('message', function (event) {
        console.log(event.data)
    });
    ws.addEventListener('open', function (event) {
        console.log('WS Connected');
        ws_connected = true;
    });
    ws.addEventListener('close', function (event) {
        console.log('WS Closed');
        ws_connected = false;
        ws_autoconnect = setTimeout(a => {
            console.log('Reconnecting');
            wsConnect();
        }, 2000);
    });
    ws.addEventListener('error', function (e) {
        console.log('WS Error');
        ws_connected = false;
    });
}

window.addEventListener("gamepadconnected", function (e) {
    gamepad = navigator.getGamepads()[e.gamepad.index];
    console.log(gamepad)
    main();
    gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 1000,
        duration: 200,
        weakMagnitude: 0.2,
        strongMagnitude: 0.2
    });
});
window.addEventListener("gamepaddisconnected", function (e) {
    clearInterval(main_loop);
    console.log('GamePad disconnected');
    buttons, axes = [];
});
function main(){
    main_loop = setInterval((a) => {
        gamepad = navigator.getGamepads()[0];
        buttons = gamepad.buttons.map(b => b.pressed);
        axes = gamepad.axes;
        let payload = JSON.stringify({
            buttons,
            axes
        });
        if(ws_connected){
            ws.send(payload);
        }
    }, main_interval);
}