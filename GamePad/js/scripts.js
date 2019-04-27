let gamepad;
let buttons = [];
let axes = [];
let interval = 100;
let ws;
const socketURL = 'ws://localhost:8080';
window.onload = function () {
    ws = new WebSocket(socketURL);
    //ws.binaryType = 'arraybuffer';
    ws.addEventListener('message', function (event) {
        updateElement('cmd', event.data);
    });
    ws.addEventListener('error', function (e) {
        updateElement('game_pad_name', 'WebSocket Disconnected Please Reload The Page');
    });
}

window.addEventListener("gamepadconnected", function (e) {
    gamepad = navigator.getGamepads()[e.gamepad.index];
    console.log(gamepad)
    gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 1000,
        duration: 200,
        weakMagnitude: 0.2,
        strongMagnitude: 0.2
    });
    updateElement('game_pad_name', `${gamepad.id} - Buttons: ${gamepad.buttons.length} - Axes: ${gamepad.axes.length}`);
    tableBase('table_buttons', gamepad.buttons, {
        id: '<b>Button',
        name: '<b>State</b>'
    });
    tableBase('table_axes', gamepad.axes, {
        id: '<b>Axes</b>',
        name: '<b>Value</b>'
    });
});
window.addEventListener("gamepaddisconnected", function (e) {
    updateElement('game_pad_name', 'GamePad Disconnected');
    updateElement('table_buttons', '');
    updateElement('table_axes', '');
    buttons, axes = [];
});
let t = setInterval((a) => {
    gamepad = navigator.getGamepads()[0];
    buttons = gamepad.buttons.map(b => b.pressed);
    axes = gamepad.axes;
    let payload = JSON.stringify({
        buttons,
        axes
    });
    updateElement('game', payload);
    ws.send(payload);
    buttons.map((b, i) => updateElementColor(`table_buttons_${i}`, b));
    axes.map((b, i) => updateElementColor(`table_axes_${i}`, b));

}, interval);

function updateElement(id, val) {
    let obj = document.getElementById(id);
    obj.innerText = val;
}

function updateElementColor(id, val) {
    let obj = document.getElementById(id);
    obj.innerText = val;
    obj.className = val === true ? 'red' : (val == 1 ? 'red' : (val == -1 ? 'red' : 'black')); //
}

function createTable(t, obj) {
    let table = document.getElementById(t);
    let row = table.insertRow(0);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell2.id = `${t}_${obj.id}`;
    cell1.innerHTML = obj.id;
    cell2.innerHTML = obj.name;
}

function tableBase(table, arr, headers) {
    let temp = [];
    temp.push(headers);
    for (let i in arr) {
        temp.push({
            id: i,
            name: i
        });
    }
    temp = temp.reverse();
    for (let f in temp) {
        createTable(table, temp[f]);
    }
}