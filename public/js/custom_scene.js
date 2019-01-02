const canvas = document.getElementById('renderCanvas'); // Get the canvas element 
let engine = null;

window.addEventListener('load', function (event) {    
    
    async function load_data() {
        engine = new BABYLON.Engine(canvas, true);
        main_ani.keys = await fetch('keys.json').then(function(response) {
            return response.json();
        });
        console.log(JSON.stringify(main_ani.keys));

        let createScene = function () {
            //SCENE
            let scene = new BABYLON.Scene(engine);
            scene.clearColor = BABYLON.Color3.Black();
            //CAMERA
            let camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 80, -160), scene);
            camera.setTarget(BABYLON.Vector3.Zero());            
            camera.attachControl(canvas, true);
            //LIGTHS
            let light_1 = new BABYLON.HemisphericLight('light_1', new BABYLON.Vector3(1, 1, 0), scene);
            //GROUND GRID         
            let ground = BABYLON.MeshBuilder.CreateGround("ground_plane", {width: plane_size, height: plane_size}, scene);
            ground.position.y = -2;
            let grid = ground.material = new BABYLON.GridMaterial('ground_grid', scene);            
            grid.gridRatio = 10;
            grid.majorUnitFrequency = 1;    
            //LOAD MODELS IN PROMISE
            Promise.all([
                BABYLON.SceneLoader.ImportMeshAsync(null, 'models/', 'TELLO_LOW.stl', scene).then(function (result) {
                    main_obj.model = result.meshes[0];
                    
                    main_obj.model.rotation.x = Math.PI / - 2;
                    main_obj.model.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);//Make Drone Size 10
                    console.log(main_obj.model.position)
                    main_obj.model.isVisible = false;
                    
                })
            ]).then(() => {
                for (let i = 0; i< num_drones; ++i) {  
                    main_obj.drones[i] = main_obj.model.clone('drone_' + i);
                    main_obj.drones[i].position.x =+ main_obj.drones[i].position.x + (drone_separation * i);
                    main_obj.drones[i].isVisible = true;
                    main_obj.drones_gui[i] = addGUI(main_obj.drones[i]);
                }
    
                //ANNIMATION
                //CREATE ANIMATION GROUP
                main_ani.group = new BABYLON.AnimationGroup("main_ani_group");
                addAnimations(main_ani.keys.drone_keys, main_ani.group);
                //ADD UI BUTTONS
                main_ui.top_panel_items.reset = addButton('⟲', '70px', main_ui.top_panel, function () {//RESTART
                    main_ani.group.restart();
                    main_ani.group.reset();
                });
                main_ui.top_panel_items.play = addButton('▶', '70px', main_ui.top_panel, function () {//PLAY
                    if(main_ani.keys.drone_keys[0][0].keys .length > 1){
                        main_ani.group.play(true);
                    }
                    else{
                        alert('ERROR \nADD A NEW FRAME TO START THE ANIMATION');
                    }
                    //main_ani.group = scene.beginAnimation(main_obj.drones[0], 0, 1000, true);
                    //console.log(JSON.stringify(main_ani.group));
                });
                main_ui.top_panel_items.pause = addButton('❚❚','70px', main_ui.top_panel, function () {//PASUE
                    main_ani.group.pause();
                });
                main_ui.top_panel_items.stop = addButton('◼', '70px', main_ui.top_panel, function () {//STOP                      
                    main_ani.group.reset();
                    main_ani.group.stop();
                });
                main_ui.top_panel_items.send = addButton('SEND', '140px', main_ui.top_panel, function () {
                    //main_ani.group.reset();
                    //main_ani.group.stop();
                });
                //RENDER LOOP
                engine.runRenderLoop(function () {
                    //UPDATE POS AND TEXT
                    //console.log(parseInt(main_ani.group.getAnimations()[0].currentFrame, 0)); FRAME RATE
                    //moment("2015-01-01").startOf('day').seconds(parseInt(main_ani.group.animatables[0].getAnimations()[0].currentFrame, 0)).format('H:mm:ss');
                    //main_ui.top_panel_items.timeframe.text = moment("2015-01-01").startOf('day').millisecond(parseInt(main_ani.group.getAnimations()[0].currentFrame, 0) * (1000 / frame_rate)).format('mm:ss:SS');
                    for(let i in main_obj.drones){
                        //drones[i].position.x +=  0.033;
                        main_obj.drones_gui[i].label.text = getCordenates(main_obj.drones[i].position);
                    }
                });
            });
    

    
    
            //UI AMIN
            main_ui.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
            //UI ANIMATION BUTTONS
            main_ui.top_panel = new BABYLON.GUI.StackPanel();
            main_ui.top_panel.isVertical = false;
            //main_ui.top_panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            main_ui.top_panel.top = 10;
            main_ui.ui.addControl(main_ui.top_panel);

            //UI TIMEFRAME
            
            //TIMEFRAME
            main_ui.top_panel_items.timeframe = new BABYLON.GUI.TextBlock();
            main_ui.top_panel_items.timeframe.height = '40px';
            main_ui.top_panel_items.timeframe.fontSize = 50;
            main_ui.top_panel_items.timeframe.width = '250px';
            main_ui.top_panel_items.timeframe.text = '00:00:00';
            main_ui.top_panel_items.timeframe.color = gui_color;
            main_ui.top_panel_items.timeframe.paddingLeft = '10px';
            main_ui.top_panel_items.timeframe.paddingRight = '10px';
            main_ui.top_panel_items.timeframe.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            main_ui.top_panel.addControl(main_ui.top_panel_items.timeframe);

            //TOP RIGHT PANEL - UI ACTIONS
            let test = new BABYLON.GUI.StackPanel();// TRANSPARENCY
            test.width = 0.12;
            test.height = 0.35;
            test.color = gui_txt_color;
            test.background = gui_bg_color;
            test.alpha	= gui_bg_alpha;
            test.top = 10;
            test.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            test.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;   
            main_ui.ui.addControl(test); 

            main_ui.top_right = new BABYLON.GUI.StackPanel();  
            main_ui.top_right.width = 0.12;
            main_ui.top_right.height = 0.35;
            main_ui.top_right.color = gui_txt_color;
            main_ui.top_right.top = 10;
            main_ui.top_right.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            main_ui.top_right.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;         
            main_ui.ui.addControl(main_ui.top_right);

            //UI ACTIONS ITEMS
            main_ui.top_right_items.add = BABYLON.GUI.Button.CreateSimpleButton('add_button', 'ADD');//IMPORTANT
            main_ui.top_right_items.add.width = 1;
            main_ui.top_right_items.add.height = '50px';
            main_ui.top_right_items.add.color = gui_color;
            main_ui.top_right_items.add.fontSize = 30;
            main_ui.top_right.addControl(main_ui.top_right_items.add);
            main_ui.top_right_items.add.onPointerUpObservable.add(function() {
                //console.log(main_val);
                //console.log(getCommand(main_val));
                main_ani.keys.command_values[0].push(main_val);
                main_ani.keys.drone_commands[0].push(getCommand(main_val));
                console.log(getFrames(main_ani.keys.drone_keys[0], main_val));
                main_ani.keys.drone_keys[0] = getFrames(main_ani.keys.drone_keys[0], main_val);

                //CLEAR ANIMATION AND RELOAD ANIMATION
                main_ani.group.dispose();
                addAnimations(main_ani.keys.drone_keys, main_ani.group);
                //PLAY ANIMATION FROM START
                main_ani.group.restart();
                main_ani.group.reset();
                main_ani.group.play(true);
                
                //console.log(getFrames(main_ani.keys.drone_keys[0], main_val));
                //main_ani.drone_keys.push({frame: frame_rate * 15, value:{x: main_val.x, y: main_val.y, z: main_val.z}});
                //main_ani.animation.setKeys(main_ani.drone_keys);
                //main_obj.drones[0].animations.push(main_ani.animation);
                //main_ani.group = scene.beginAnimation(main_obj.drones[0], 0, 1000, true);
                //main_ani.group.dispose();
                
                //main_ui.top_panel_items.stop.dispose();
            });
            //TXT DESCRIPTION
            main_ui.top_right_items.desc = new BABYLON.GUI.TextBlock();
            main_ui.top_right_items.desc.height = '60px';
            main_ui.top_right_items.desc.fontSize = 15;
            main_ui.top_right_items.desc.text = 'SELECT OPTION';
            main_ui.top_right.addControl(main_ui.top_right_items.desc);   
            //UI SUB MENU
            main_ui.bottom_right = new BABYLON.GUI.StackPanel();  
            main_ui.bottom_right.width = 0.12;
            main_ui.bottom_right.height = 0.3;
            main_ui.bottom_right.color = gui_txt_color;
            main_ui.bottom_right.background = gui_bg_color;
            main_ui.bottom_right.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            main_ui.bottom_right.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;   
            main_ui.ui.addControl(main_ui.bottom_right);
            //CREATE OPTIONS
            for(let i in options_1_3){                
                main_ui.top_right_items.options[i] = addRadio(options_1_3[i], main_ui);
            }    
            return scene;
        };
        let render_scene = createScene();//render_scene.dispose() //KILL SCENE
        engine.runRenderLoop(function () {
            render_scene.render();
        });
    }      
    load_data();
});

window.addEventListener('resize', function () {
    console.log('Widnow Resize');
    engine.resize();
});


//FUNCTIONS
function addGUI(drone){
    let drone_ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    let trans = new BABYLON.GUI.Rectangle();
    trans.width = 0.05;
    trans.height = '80px';
    trans.cornerRadius = 5;
    trans.thickness = 2;
    trans.background = gui_bg_color;
    trans.alpha	= gui_bg_alpha;
    trans.color = gui_color;
    drone_ui.addControl(trans);
    trans.linkWithMesh(drone);   
    trans.linkOffsetY = -150;
    let rect1 = new BABYLON.GUI.Rectangle();
    rect1.width = 0.05;
    rect1.height = '80px';
    rect1.cornerRadius = 5;
    rect1.thickness = 2;
    rect1.color = gui_color;
    drone_ui.addControl(rect1);
    rect1.linkWithMesh(drone);   
    rect1.linkOffsetY = -150;
    let label = new BABYLON.GUI.TextBlock();
    label.text = '0,0,0';
    label.color = gui_txt_color;
    rect1.addControl(label);
    let target = new BABYLON.GUI.Ellipse();
    target.width = '20px';
    target.height = '20px';
    target.color = gui_color;
    target.thickness = 2;
    drone_ui.addControl(target);
    target.linkWithMesh(drone);   
    let line = new BABYLON.GUI.Line();
    line.lineWidth = 2;
    line.y2 = 40;
    line.linkOffsetY = -10;
    line.color = gui_color;
    drone_ui.addControl(line);
    line.linkWithMesh(drone); 
    line.connectedControl = rect1;
    //advancedTexture.idealWidth = 1000;
    return {rect1, label, target, line};
}
function getCordenates(obj){
    return `X: ${Number.parseFloat(obj.x).toFixed(2)}\nY: ${Number.parseFloat(obj.y).toFixed(2)}\nZ: ${Number.parseFloat(obj.z).toFixed(2)}`;
}
function addButton(text, width, parent, callback) {
    let button = BABYLON.GUI.Button.CreateSimpleButton('button', text);
    button.width = width;
    button.height = '40px';
    button.color = gui_color;
    button.background = gui_bg_color;
    button.paddingLeft = '10px';
    button.paddingRight = '10px';
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button.onPointerUpObservable.add(function () {
        callback();
    });
    parent.addControl(button);
    return button;
};
function addRadio(item, parent) {
    let button = new BABYLON.GUI.RadioButton();
    button.width = '10px';
    button.height = '10px';
    button.color = gui_color;
    button.background = gui_bg_color;
    button.onIsCheckedChangedObservable.add(function(state) {
        if (state) {
            parent.top_right_items.desc.text = item.desc;
            //CLEAN BOTTOM RIGHT ITEMS
            if(main_ui.bottom_right_items.length > 0){
                for(let i in main_ui.bottom_right_items){
                    for(let f in main_ui.bottom_right_items[i]){//arr.pop();arr.shift();                        
                        main_ui.bottom_right_items[i][f].dispose();
                    }
                }
            }
            main_ui.bottom_right_items = [];
            //CLEAN MAIN VAL
            let arr = Object.keys(main_val);
            for(let i in arr){
                main_val[arr[i]] = 0;
            }
            //SET COMMAND TO MAIN_VAL
            main_val.command = item.command;
            //ADD NEW BOTTOM RIGHT ITEMS
            if(item.options.length > 0){
                for(let i in item.options){
                    main_ui.bottom_right_items.push(createSlider(item.options[i].min, item.options[i].max, item.options[i].val, item.options[i].unit, parent.bottom_right))
                }
            }
        }
    });
    let header = BABYLON.GUI.Control.AddHeader(button, item.name.toUpperCase(), '200px', { isHorizontal: true, controlFirst: true });
    header.height = '15px';
    header.children[1].fontSize = 15;
    header.children[1].onPointerDownObservable.add(function() {
        button.isChecked = !button.isChecked;
    });
    parent.top_right.addControl(header);
    return addRadio;
}
function createSlider(min, max, val, sym, parent){
    main_val[val] = (max / 2);//DEFAULT VAL
    let header = new BABYLON.GUI.TextBlock();
    header.text = `${val} ${max / 2} ${sym}.`;
    header.height = '20px';
    header.fontSize = 15;
    header.color = gui_txt_color;
    header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    header.marginTop = '10px';
    parent.addControl(header);
    let slider = new BABYLON.GUI.Slider();
    slider.minimum = min;
    slider.maximum = max;
    slider.color = gui_color;
    slider.value = max / 2;
    slider.height = '20px';
    slider.onValueChangedObservable.add(function(value) {
        let res = parseInt(value, 0);
        main_val[val] = res;
        header.text = `${val} ${res} ${sym}.`;
    });
    parent.addControl(slider);
    return [header, slider];
}
function getCommand(values){
    switch(values.command) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
        case 'forward':
        case 'back':
        case 'cw':
        case 'ccw':
            return `${values.command} ${values.deg}`;
            break;
        case 'flip':
            return `${values.command} ${values.dir}`;
            break;
        case 'go':
            return `${values.command} ${values.x} ${values.y} ${values.z} ${values.speed}`;
            break;
        case 'curve':
            return `${values.command} ${values.x1} ${values.y1} ${values.z1} ${values.x2} ${values.y2} ${values.z2} ${values.speed}`;
            break;
        default:
            return values.command;
    }
}
function getFrames(keys, values){
    console.log('getFrames CALLED')
    let speed = 50;
    let anim_type = getFrameType(values.command);
    let last_frame_type = keys[keys.length - 1];
    let last_frame = last_frame_type.keys[last_frame_type.keys.length - 1];

    console.log(anim_type)
    console.log(values.command)

    switch(values.command) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
        case 'forward':
        case 'back':
        case 'go':
            if(last_frame_type.type == anim_type.type){
                console.log('GO CALLED')
            }
            return {type: 'position', ani_type: 'ANIMATIONTYPE_VECTOR3',ani_mode: 'ANIMATIONLOOPMODE_CYCLE'};
            break;
        case 'takeoff':
            if(last_frame_type.type == anim_type.type){
                let dest = {x: last_frame.value.x, y: 40, z: last_frame.value.z};
                console.log(getFrameDuration(speed, last_frame.value, dest));
                keys[keys.length - 1].keys.push({frame: frame_rate * getFrameDuration(speed, last_frame.value, dest), value: dest});
            }
            else{
                console.log('FALSE')
            }
            break
        case 'land':
            if(last_frame_type.type == anim_type.type){
                let dest = {x: last_frame.value.x, y: 0, z: last_frame.value.z};
                keys[keys.length - 1].keys.push({frame: last_frame.frame + (frame_rate * getFrameDuration(speed, last_frame.value, dest)), value: dest});
            }
            else{
                console.log('FALSE')
            }
            break;
        case 'flip':
            //return `${values.command} ${values.dir}`;
            break;
        case 'curve':
            //return `${values.command} ${values.x1} ${values.y1} ${values.z1} ${values.x2} ${values.y2} ${values.z2} ${values.speed}`;
            break;
        default:
            return values.command;
    }
    return keys;
}
function getFrameDuration(speed, a, b){
    let max_travel = 0;
    let arr = Object.keys(b);
    for(let i in arr){
        let temp = Math.abs(b[arr[i]] - a[arr[i]]);
        if(temp > max_travel){
            max_travel = temp;
        }
    }
    let res = parseInt(max_travel / speed, 0);
    if(res > 1){
        return res;
    }
    else return 1;
}
function getFrameType(command){
    switch(command) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
        case 'forward':
        case 'back':
        case 'takeoff':
        case 'land':
        case 'go':
            return {type: 'position', ani_type: 'ANIMATIONTYPE_VECTOR3',ani_mode: 'ANIMATIONLOOPMODE_CYCLE'};
            break;
        case 'flip':
            //return `${values.command} ${values.dir}`;
            break;
        case 'curve':
            //return `${values.command} ${values.x1} ${values.y1} ${values.z1} ${values.x2} ${values.y2} ${values.z2} ${values.speed}`;
            break;
        default:
            return values.command;
    }
}
function addAnimations(drones, parent){
    for(let i in drones){
        for(let j in drones[i]){//KEYS FROM 1 DRONE
            let animaton = new BABYLON.Animation(`drone_${i}_${j}`, drones[i][j].type, frame_rate, BABYLON.Animation[drones[i][j].ani_type], BABYLON.Animation[drones[i][j].ani_mode]);
            animaton.setKeys(drones[i][j].keys);
            parent.addTargetedAnimation(animaton, main_obj.drones[i]);
        }
    }
}
/*
//COMMANDS
    takeoff
    land
    emergency
    up x  ( 20-500 )
    down x
    left x
    right x 
    forward x
    back x
    cw x (1-3600 )
    ccw x
    flip x (l, r, f b)
    go x y z speed (x: 20-500 y: 20-500 z: 20-500 speed: 10-100 cm/s)
    curve x1 y1 z1 x2 y2 z2 speed (x1, x2: 20-500 y1, y2: 20-500 z1, z2: 20-500, speed: 10-60)
*/

/*
//ANIMATION 

    BABYLON.Animation.ANIMATIONTYPE_FLOAT
    BABYLON.Animation.ANIMATIONTYPE_VECTOR2
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
    BABYLON.Animation.ANIMATIONTYPE_QUATERNION
    BABYLON.Animation.ANIMATIONTYPE_COLOR3

    Use previous values and increment it −

    BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE

    Restart from initial value −

    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE

    Keep their final value

    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT

*/