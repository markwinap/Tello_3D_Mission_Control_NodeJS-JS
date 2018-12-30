const plane_size = 500;
const num_drones = 1;
const drone_separation = 20;
const frame_rate = 60;
const gui_color = 'orange';
const gui_txt_color = 'orange';
const gui_bg_color = 'black';

const canvas = document.getElementById('renderCanvas'); // Get the canvas element 
let engine = null;
let drone = null;
let drones = [];
let guis = [];


//ANIMATION KEYS
const keys = [];
keys.push({
    frame: 0,
    value: new BABYLON.Vector3(0, 0, 0)
});
keys.push({
    frame: 3 * frame_rate,
    value: new BABYLON.Vector3(10, 0, 0)
});
keys.push({
    frame: 5 * frame_rate,
    value: new BABYLON.Vector3(20, 0, 0)
});
keys.push({
    frame: 8 * frame_rate,
    value: new BABYLON.Vector3(30, 0, 0)
});

/*
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

window.addEventListener('load', function (event) {
    engine = new BABYLON.Engine(canvas, true);
    let createScene = function () {
        //SCENE
        let scene = new BABYLON.Scene(engine);
        scene.clearColor = BABYLON.Color3.Black();
        //CAMERA
        let camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 0, -50), scene);
        camera.attachControl(canvas, true);
        //LOAD MODELS
        Promise.all([
            BABYLON.SceneLoader.ImportMeshAsync(null, 'models/', 'TELLO_LOW.stl', scene).then(function (result) {
                drone = result.meshes[0];
                drone.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);//Make Drone Size 10
                drone.isVisible = false;               
                
            })
        ]).then(() => {
            for (let i = 0; i< num_drones; ++i) {  
                drones[i] = drone.clone('drone_' + i);
                drones[i].position.x =+ drones[i].position.x + (drone_separation * i);
                drones[i].isVisible = true;
                guis[i] = addGUI(drones[i]);
            }

            //ANNIMATION
            let animation_1 = new BABYLON.Animation('animation_1', 'position', frame_rate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            animation_1.setKeys(keys);
            // Create the animation group
            let animation_group = new BABYLON.AnimationGroup('animation_group');
            //animation_group.addTargetedAnimation(animation_1, drones[1]);
            animation_group.addTargetedAnimation(animation_1, drones[0]);
            //animation_group.normalize(0, 100);


            let addButton = function (text, callback) {
                let button = BABYLON.GUI.Button.CreateSimpleButton('button', text);
                button.width = '140px';
                button.height = '40px';
                button.color = gui_color;
                button.background = gui_bg_color;
                button.paddingLeft = '10px';
                button.paddingRight = '10px';
                button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
                button.onPointerUpObservable.add(function () {
                    callback();
                });
                panel.addControl(button);
            };
            addButton('PLAY', function () {
                animation_group.play(true);
            });
            addButton('PAUSE', function () {
                animation_group.pause();
            });
            addButton('STOP', function () {
                animation_group.reset();
                animation_group.stop();
            });

            //RENDER LOOP
            engine.runRenderLoop(function () {//turn camera
                //camera.alpha += 0.033;
                //UPDATE POS AND TEXT
                for(let i in drones){
                    //drones[i].position.x +=  0.033;
                    guis[i].label.text = getCordenates(drones[i].position);
                }
            });
        });


        //LIGTHS
        let light_1 = new BABYLON.HemisphericLight('light_1', new BABYLON.Vector3(1, 1, 0), scene);

        //GROUND GRID
        let ground = BABYLON.MeshBuilder.CreatePlane('ground_plane', {width: plane_size, height: plane_size}, scene);
        let grid = ground.material = new BABYLON.GridMaterial('ground_grid', scene);
        grid.gridRatio = 10;
        grid.majorUnitFrequency = 1;



        //UI PLAY BUTTONS
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
        let panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = false;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        panel.top = 10;
        advancedTexture.addControl(panel);
        //UI ACTIONS
        let ui_actions = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

        let selectBox = new BABYLON.GUI.StackPanel();  
        selectBox.width = 0.12;
        selectBox.height = 0.6;
        selectBox.color = gui_txt_color;
        selectBox.background = gui_bg_color;
        selectBox.top = 10;
        selectBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        selectBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;         
        ui_actions.addControl(selectBox);




        let test = null;
    
        let action_button = BABYLON.GUI.Button.CreateSimpleButton('add_button', 'ADD');
        action_button.width = 1;
        action_button.height = '50px';
        action_button.color = gui_color;
        action_button.fontSize = 30;
        action_button.background = gui_bg_color;
        selectBox.addControl(action_button);
        action_button.onPointerUpObservable.add(function() {
            console.log(test)
        });

        let option_text = new BABYLON.GUI.TextBlock();
        option_text.height = '60px';
        option_text.fontSize = 15;
        option_text.text = 'SELECT OPTION';
        selectBox.addControl(option_text);   
    
        let addRadio = function(text, command, description, parent) {    
            let button = new BABYLON.GUI.RadioButton();
            button.width = '10px';
            button.height = '10px';
            button.color = gui_color;
            button.background = gui_bg_color;
    
            button.onIsCheckedChangedObservable.add(function(state) {
                if (state) {
                    option_text.text = description;
                    test = command;
                    console.log(command)
                }
            }); 
    
            let header = BABYLON.GUI.Control.AddHeader(button, text.toUpperCase(), '200px', { isHorizontal: true, controlFirst: true });
            header.height = '30px';
            header.children[1].fontSize = 25;
            header.children[1].onPointerDownObservable.add(function() {
                button.isChecked = !button.isChecked;
            });
            parent.addControl(header);
        }
    
    
        addRadio('Takeoff', 'takeoff', '', selectBox);
        addRadio('Land', 'land', '', selectBox);
        addRadio('Emergency', 'emergency', 'Stop Motors', selectBox);
        addRadio('Up', 'up', 'up x\n20-500 cm', selectBox);
        addRadio('Down', 'down', 'down x\n20-500 cm', selectBox);
        addRadio('Left', 'left', 'up x\n20-500 cm', selectBox);
        addRadio('Right', 'right', 'up x\n20-500 cm', selectBox);
        addRadio('Forward', 'forward', 'up x\n20-500 cm', selectBox);
        addRadio('Backward', 'back', 'up x\n20-500 cm', selectBox);
        addRadio('Rotate CW', 'cw', 'cw x\n1-3600 cm', selectBox);
        addRadio('Rotate CCW', 'ccw', 'ccw x\n1-3600', selectBox);
        addRadio('Flip', 'flip', 'flip x\nDirection l, r, f, b', selectBox);
        addRadio('Cordinate', 'go', 'go x y z speed\nx, y, z: 20-500\nspeed: 10-100 cm/s', selectBox);
        addRadio('Curve', 'curve', 'curve x1 y1 z1 x2 y2 z2 speed\nx1, x2, y1, y2, z1, z2 -20-500cm\nspeed: 10-60cm/s', selectBox);

        //createSlider(20, 500, 'DISTANCE', 'cm', selectBox);
        //createSlider(20, 500, 'X', 'cm', selectBox);
        //createSlider(20, 500, 'Y', 'cm', selectBox);
        //createSlider(20, 500, 'Z', 'cm', selectBox);
        //createSlider(20, 500, 'SPEED', 'cm/s', selectBox);


        //UI SUB MENU
        let ui_menu = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

        let menu_box = new BABYLON.GUI.StackPanel();  
        menu_box.width = 0.12;
        menu_box.height = 0.3;
        menu_box.color = gui_txt_color;
        menu_box.background = gui_bg_color;
        menu_box.top = 10;
        menu_box.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        menu_box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;   
        ui_menu.addControl(menu_box);

        createSlider(20, 500, 'X', 'cm', menu_box);
        createSlider(20, 500, 'Y', 'cm', menu_box);
        createSlider(20, 500, 'Z', 'cm', menu_box);
        createSlider(20, 500, 'SPEED', 'cm/s', menu_box);

        function createSlider(min, max, val, sym, parent){
            let header = new BABYLON.GUI.TextBlock();
            header.text = `${val} SLIDER`;
            header.height = '40px';
            header.color = gui_txt_color;
            header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            header.marginTop = '10px';
            parent.addControl(header);
            let slider = new BABYLON.GUI.Slider();
            slider.minimum = min;
            slider.maximum = max;
            slider.color = gui_color;
            slider.value = min;
            slider.height = '20px';
            slider.onValueChangedObservable.add(function(value) {
                let res = parseInt(value, 0);
                console.log(res)
                header.text = `${val} ${res} ${sym}.`;
            });
            parent.addControl(slider);
        }
        /*
                colorGroup.addCheckbox('Takeoff', function(data){console.log(data)}.bind('marco'));
        colorGroup.addCheckbox('Land', acctionType('takeoff'));
        colorGroup.addRadio('Stop Motors', acctionType, 'emergency');
        colorGroup.addRadio('Up', acctionType, 'up');
        colorGroup.addRadio('Down', acctionType, 'down');
        colorGroup.addRadio('Left', acctionType, 'left');
        colorGroup.addRadio('Right', acctionType, 'right');
        colorGroup.addRadio('Forward', acctionType, 'forward');
        colorGroup.addRadio('Backward', acctionType, 'back');
        colorGroup.addRadio('Rotate Clockwise', acctionType, 'cw');
        colorGroup.addRadio('Rotate Counterclockwise', acctionType, 'ccw');
        colorGroup.addRadio('Flip', acctionType, 'flip');
        colorGroup.addRadio('Go To Cordinate', acctionType, 'go');
        colorGroup.addRadio('Curve', acctionType, 'curve');
        selectBox.addGroup(colorGroup);
        */
        
        return scene;
    };
    let render_scene = createScene();
    engine.runRenderLoop(function () {
        render_scene.render();
    });
});

window.addEventListener('resize', function () {
    console.log('Widnow Resize');
    engine.resize();
});
function addGUI(drone){
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    let rect1 = new BABYLON.GUI.Rectangle();
    rect1.width = 0.05;
    rect1.height = '80px';
    rect1.cornerRadius = 5;
    rect1.thickness = 2;
    rect1.background = gui_bg_color;
    rect1.color = gui_color;
    advancedTexture.addControl(rect1);
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
    advancedTexture.addControl(target);
    target.linkWithMesh(drone);   
    let line = new BABYLON.GUI.Line();
    line.lineWidth = 2;
    line.y2 = 40;
    line.linkOffsetY = -10;
    line.color = gui_color;
    advancedTexture.addControl(line);
    line.linkWithMesh(drone); 
    line.connectedControl = rect1;
    //advancedTexture.idealWidth = 1000;
    return {rect1, label, target, line};
}
function getCordenates(obj){
    return `X: ${Number.parseFloat(obj.x).toFixed(2)}\nY: ${Number.parseFloat(obj.y).toFixed(2)}\nZ: ${Number.parseFloat(obj.z).toFixed(2)}`;
}