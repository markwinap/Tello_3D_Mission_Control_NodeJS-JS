const plane_size = 500;
const num_drones = 1;
const drone_separation = 20;
const frame_rate = 60;
const gui_color = 'orange';
const gui_txt_color = 'orange';
const gui_bg_color = 'black';
const gui_bg_alpha = 0.6;

let options_1_3 = [
    //NAME - COMMAND, DESC, MIN VAL, MAX VAL, VARIABLE,
    {name: 'Command', command: 'command', desc: 'Enable Command Moed', options: []},
    {name: 'Takeoff', command: 'takeoff', desc: 'Ready To Rock', options: []},
    {name: 'Land', command: 'land', desc: 'Land The Aircraft', options: []},
    {name: 'Emergency', command: 'emergency', desc: 'Stop Motors', options: []},
    {name: 'Up', command: 'up', desc: 'up x\n20-500 cm', options: [{min: 20, max: 500, val: 'x', unit: 'cm'}]},
    {name: 'Down', command: 'down', desc: 'down x\n20-500 cm', options: [{min: 20, max: 500, val: 'x', unit: 'cm'}]},
    {name: 'Left', command: 'left', desc: 'left x\n20-500 cm', options: [{min: 20, max: 500, val: 'x', unit: 'cm'}]},
    {name: 'Right', command: 'right', desc: 'right x\n20-500 cm', options: [{min: 20, max: 500, val: 'x', unit: 'cm'}]},
    {name: 'Forward', command: 'forward', desc: 'forward x\n20-500 cm', options: [{min: 20, max: 500, val: 'x', unit: 'cm'}]},
    {name: 'Backward', command: 'back', desc: 'back x\n20-500 cm', options: [{min: 20, max: 500, val: 'x', unit: 'cm'}]},
    {name: 'Rotate CW', command: 'cw', desc: 'cw x\n1-3600', options: [{min: 1, max: 3600, val: 'deg', unit: 'Degrees'}]},
    {name: 'Rotate CCW', command: 'ccw', desc: 'ccw x\n1-3600', options: [{min: 1, max: 3600, val: 'deg', unit: 'Degrees'}]},
    {name: 'Flip', command: 'flip', desc: 'flip x\n20-500 cm', options: [{min: 20, max: 500, val: 'dir', unit: 'Direction'}]},
    {name: 'Cordinate', command: 'go', desc: 'go x y z speed\nx, y, z: 20-500\nspeed: 10-100 cm/s', options: [
        {min: 20, max: 500, val: 'x', unit: 'cm'},
        {min: 20, max: 500, val: 'y', unit: 'cm'},
        {min: 20, max: 500, val: 'z', unit: 'cm'},
        {min: 10, max: 100, val: 'speed', unit: 'cm/s'}]},
    {name: 'Curve', command: 'curve', desc: 'curve x1 y1 z1 x2 y2 z2 speed\nx1, x2, y1, y2, z1, z2 -20-500cm\nspeed: 10-60cm/s', options: [
        {min: 20, max: 500, val: 'x1', unit: 'cm'},
        {min: 20, max: 500, val: 'y1', unit: 'cm'},
        {min: 20, max: 500, val: 'z1', unit: 'cm'},
        {min: 20, max: 500, val: 'x2', unit: 'cm'},
        {min: 20, max: 500, val: 'y2', unit: 'cm'},
        {min: 20, max: 500, val: 'z2', unit: 'cm'},
        {min: 10, max: 100, val: 'speed', unit: 'cm/s'}]}
];


//OBJECT PLACEHOLDERS

let main_obj = {
    model: null,
    drones: [],
    drones_gui: [],

};
let main_ui = {
    ui: {},
    top_panel: {},
    top_panel_items: {
        play: {},
        pause: {},
        stop: {},
        reset: {},
        semd: {},
        timeframe: {}
    },
    top_right: {},
    top_right_items: {
        add: {},
        desc: {},
        options: []
    },
    bottom_right: {},
    bottom_right_items: []
};
let main_val = {
    command: null,
    x: 0,
    y: 0,
    z: 0,
    x1: 0,
    y2: 0,
    z1: 0,
    x2: 0,
    y2: 0,
    z2: 0,
    deg: 0,
    direction: null,
    speed: 0
};
let main_ani = {
    animation: {},
    group: {},
    keys: {}//drone_keys, drone_commands, command_vaues
};