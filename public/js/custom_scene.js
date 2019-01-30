
let test = [];

const canvas = document.getElementById('renderCanvas'); // Get the canvas element 
let engine = null;

window.addEventListener('load', function (event) {    
    fetch('http://localhost:3000/getKeys')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      engine = new BABYLON.Engine(canvas, true);
      main_ani.keys = json;
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
                  main_obj.model.isVisible = false;
                  
              })
          ]).then(() => {
              for(let i in main_ani.keys.drone_keys){
                main_obj.drones[i] = main_obj.model.clone('drone_' + i);
                main_obj.drones[i].position.x =+ main_obj.drones[i].position.x + (drone_separation * i);
                main_obj.drones[i].isVisible = true;
                main_obj.drones_gui[i] = addGUI(main_obj.drones[i], i);
              }
              //ANNIMATION
              //CREATE ANIMATION GROUP
             
              addAnimations(main_ani.keys.drone_keys);
              renderTopUI();
              renderBottomUI(0);
              selectedPreset('A');

              //RENDER LOOP
              engine.runRenderLoop(function () {
                  //RENTER TIMER
                  if(timmer){
                      if(main_ani.group.animatables.length > 0){
                        main_ui.top_panel_items.timeframe.text = moment("2015-01-01").startOf('day').millisecond(parseInt(main_ani.group.animatables[0].getAnimations()[0].currentFrame, 0) * (1000 / frame_rate)).format('mm:ss:SS');
                      }
                      
                  }
                  for(let i in main_obj.drones){
                      //drones[i].position.x +=  0.033;
                      main_obj.drones_gui[i].label.text = getCordenates(main_obj.drones[i].position);
                  }
              });
          });
  

  
  
          //CREATE MAIN UI
          main_ui.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
          //TOP LEFT PANEL - ACTION LIST
          renderActionList(0, 0);
              //STATS
            renderStats();



          return scene;
      };
      let render_scene = createScene();//render_scene.dispose() //KILL SCENE
      engine.runRenderLoop(function () {
          render_scene.render();
      });
    });
});

window.addEventListener('resize', function () {
    console.log('Widnow Resize');
    engine.resize();
});


//FUNCTIONS
function addGUI(model, drone){
    let drone_ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    let trans = new BABYLON.GUI.Rectangle();
    trans.width = 0.05;
    trans.height = '80px';
    trans.cornerRadius = 5;
    trans.thickness = 2;
    trans.background = main_ani.keys.drone_keys.length == 1 ? gui_bg_color : (main_val.drone == drone ? gui_color : gui_bg_color);
    trans.alpha	= gui_bg_alpha;
    //trans.color = main_val.drone == drone ? gui_bg_color : gui_color;
    drone_ui.addControl(trans);
    trans.linkWithMesh(model);   
    trans.linkOffsetY = -150;
    let rect1 = new BABYLON.GUI.Rectangle();
    rect1.width = 0.05;
    rect1.height = '80px';
    rect1.cornerRadius = 5;
    rect1.thickness = 2;
    rect1.color = gui_color;
    drone_ui.addControl(rect1);
    rect1.linkWithMesh(model);   
    rect1.linkOffsetY = -150;
    rect1.onPointerClickObservable.add(function () {//SELECT DRONE
        main_val.drone = drone;
        console.log(main_val.drone)
        renderMainUI(drone, main_ani.keys.drone_commands[drone].length - 1, false);
    });
    let label = new BABYLON.GUI.TextBlock();
    label.text = '0,0,0';
    label.color = main_ani.keys.drone_keys.length == 1 ? gui_color : (main_val.drone == drone ? gui_bg_color : gui_color);
    rect1.addControl(label);
    let target = new BABYLON.GUI.Ellipse();
    target.width = '20px';
    target.height = '20px';
    target.color = gui_color;
    target.thickness = 2;
    drone_ui.addControl(target);
    target.linkWithMesh(model);   
    let line = new BABYLON.GUI.Line();
    line.lineWidth = 2;
    line.y2 = 40;
    line.linkOffsetY = -10;
    line.color = gui_color;
    drone_ui.addControl(line);
    line.linkWithMesh(model); 
    line.connectedControl = rect1;
    //advancedTexture.idealWidth = 1000;
    return {drone_ui, rect1, label, target, line};
}
function getCordenates(obj){
    return `X: ${Number.parseFloat(obj.x).toFixed(2)}\nY: ${Number.parseFloat(obj.y).toFixed(2)}\nZ: ${Number.parseFloat(obj.z).toFixed(2)}`;
}
function addButton(text, width, parent, inverted, callback) {
    let button = BABYLON.GUI.Button.CreateSimpleButton('button2', text);
    button.width = width;
    button.height = '40px';
    button.color = inverted ? gui_bg_color : gui_color;
    button.background = inverted ? gui_color: gui_bg_color;
    button.paddingLeft = '10px';
    button.paddingRight = '10px';
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button.onPointerUpObservable.add(function () {
        callback();
    });
    parent.addControl(button);
    return button;
};
function addActionListButton(text, parent, command, drone, selected, callback) {
    let p = new BABYLON.GUI.StackPanel();
    p.isVertical = false;
    p.height = '25px';
    parent.addControl(p);
    let cmd = BABYLON.GUI.Button.CreateSimpleButton('button3', text);
    cmd.color = selected ? gui_bg_color : gui_color;
    cmd.background = selected ? gui_color : gui_bg_color;
    cmd.width = '280px';
    cmd.fontSize = 15;
    cmd.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    cmd.onPointerUpObservable.add(function () {
        callback(command, drone);
        main_ui.top_left.dispose();
        main_ui.top_left_trans.dispose();
        main_ui.top_right.dispose();
        main_ui.top_right_trans.dispose();
        renderActionList(command, drone)
    });
    p.addControl(cmd);
    let x = BABYLON.GUI.Button.CreateSimpleButton('button4', 'X');//DELETE BUTTON
    x.color = selected ? gui_bg_color : gui_color;//gui_color
    x.background = selected ? gui_color : gui_bg_color;//gui_bg_color
    x.width = '25px';
    x.fontSize = 15;
    x.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    x.onPointerUpObservable.add(function () {
        fetch('http://localhost:3000/deleteKeys', {
            method: 'POST',
            body: JSON.stringify({drone: drone, frame: command, preset: preset}),
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            main_ani.keys = response;
            main_val.deg = response.command_values[main_val.drone][response.command_values[main_val.drone].length - 1].deg;
            //RE RENDER UI
            renderMainUI(main_val.drone, main_ani.keys.drone_commands[main_val.drone].length - 1, true);

          })
          .catch(error => console.error('Error:', error));
    });
    p.addControl(x);
    //panel.addControl(X);
    return cmd;
};
function addRadio(selected, item, main_ui) {
    if(selected == item.command){
        renderActionDetails(item, main_ui);
    }
    let button = new BABYLON.GUI.RadioButton();
    button.width = '10px';
    button.height = '10px';
    button.color = gui_color;
    button.background = gui_bg_color;
    button.isChecked = selected == item.command ? true : false;
    button.onIsCheckedChangedObservable.add(function(state) {
        if (state) {
            renderActionDetails(item, main_ui);
        }
    });
    let header = BABYLON.GUI.Control.AddHeader(button, item.name.toUpperCase(), '180px', { isHorizontal: true, controlFirst: true });
    header.height = '15px';
    header.children[1].fontSize = 15;
    header.children[1].onPointerDownObservable.add(function() {
        button.isChecked = !button.isChecked;
    });
    main_ui.top_right.addControl(header);
    return addRadio;
}
function createSlider(min, max, val, sym, sValue, cmd, parent){
    console.log(`MIN ${min} - MAX ${max} - VAL ${val} - SVAL ${sValue} - CMD ${cmd}`)
    let dir = ['', 'LEFT', 'RIGTH', 'FORWARD', 'BACKWARD'];
    main_val[val] = (max / 2);//DEFAULT VAL
    let header = new BABYLON.GUI.TextBlock();
    header.text = cmd == 'flip' ?  `FLIP ${dir[max / 2]}.` : `${val} ${max / 2} ${sym}.`;
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
    slider.value = sValue;
    slider.height = '20px';
    slider.isThumbCircle = true;
    slider.onValueChangedObservable.add(function(value) {
        let res = parseInt(value, 0);
        main_val[val] = res;       
        //header.text = `${val} ${res} ${sym}.`;        
        header.text = (cmd == 'flip' ?  `FLIP ${dir[res]}.` : `${val} ${res} ${sym}.`);
    });
    parent.addControl(slider);
    return [header, slider];
}
function addAnimations(drones){//GET ALL ANIMATION KEYS FROM ALL DRONES AND CREATE ANIMATION GROUP
    main_ani.group = new BABYLON.AnimationGroup("main_ani_group");
    for(let i in drones){
        let ani = Object.keys(drones[i]);
        for(let o in ani){//position, rotation_x, rotation_y, rotation_z
            let animaton = new BABYLON.Animation(`drone_${i}_${ani[o]}`, drones[i][ani[o]].type, frame_rate, BABYLON.Animation[drones[i][ani[o]].ani_type], BABYLON.Animation[drones[i][ani[o]].ani_mode]);
            animaton.setKeys(drones[i][ani[o]].keys);
            main_ani.group.addTargetedAnimation(animaton, main_obj.drones[i]);
        }
    }
    timmer = true;
}
function renderActionList(selected, drone){
    main_val = main_ani.keys.command_values[drone][main_ani.keys.command_values[drone].length - 1];
    //TOP LEFT
    main_ui.top_left_trans = new BABYLON.GUI.StackPanel();// TRANSPARENCY
    main_ui.top_left_trans.width = 0.16;
    main_ui.top_left_trans.height = 1;
    main_ui.top_left_trans.color = gui_txt_color;
    main_ui.top_left_trans.background = gui_bg_color;
    main_ui.top_left_trans.alpha = gui_bg_alpha;
    main_ui.top_left_trans.top = 10;
    main_ui.top_left_trans.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    main_ui.top_left_trans.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;   
    main_ui.ui.addControl(main_ui.top_left_trans);
    main_ui.top_left = new BABYLON.GUI.StackPanel();
    main_ui.top_left.width = 0.16;
    main_ui.top_left.height = 1;
    main_ui.top_left.top = 10;
    main_ui.top_left.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    main_ui.top_left.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;   
    main_ui.ui.addControl(main_ui.top_left);

    //ADD BUTTON
    let add = BABYLON.GUI.Button.CreateSimpleButton('add_button', 'ADD');//IMPORTANT
    add.width = 1;
    add.height = '40px';
    add.color = gui_color;
    add.fontSize = 25;
    add.paddingBottom = '10px';
    main_ui.top_left.addControl(add);
    add.onPointerUpObservable.add(function() {
        fetch('http://localhost:3000/addKeys', {
            method: 'POST',
            body: JSON.stringify({drone: drone, command: 'command', preset: preset, deg: main_val.deg, direction: 0, speed: 0, x: 0, x1: 0, x2: 0, y: 0, y2: 0, z: 0, z1: 0, z2: 0}), // data can be `string` or {object}!
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            main_ani.keys = response;
            main_val.deg = response.command_values[drone][response.command_values[drone].length - 1].deg;
            //RE RENDER UI
            renderMainUI(drone, main_ani.keys.drone_commands[drone].length - 1, false);
          })
          .catch(error => console.error('Error:', error));
    });
    
    //TOP RIGHT PANEL - UI ACTIONS
    main_ui.top_right_trans = new BABYLON.GUI.StackPanel();// TRANSPARENCY
    main_ui.top_right_trans.width = 0.12;
    main_ui.top_right_trans.height = 1;
    main_ui.top_right_trans.background = gui_bg_color;
    main_ui.top_right_trans.alpha	= gui_bg_alpha;
    main_ui.top_right_trans.top = 10;
    main_ui.top_right.paddingRight = '30px';
    main_ui.top_right.paddingLeft = '10px';
    main_ui.top_right_trans.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    main_ui.top_right_trans.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;   
    main_ui.ui.addControl(main_ui.top_right_trans);
    main_ui.top_right = new BABYLON.GUI.StackPanel();  
    main_ui.top_right.width = 0.12;
    main_ui.top_right.height = 1;
    main_ui.top_right.color = gui_txt_color;
    main_ui.top_right.top = 10;
    //main_ui.top_right.rigth = 50;
    main_ui.top_right.paddingRight = '30px';
    main_ui.top_right.paddingLeft = '10px';
    main_ui.top_right.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    main_ui.top_right.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;         
    main_ui.ui.addControl(main_ui.top_right);
    //ADD BUTTON
    let update = BABYLON.GUI.Button.CreateSimpleButton('add_button', 'UPDATE');//IMPORTANT
    update.width = 1;
    update.height = '40px';
    update.color = gui_color;
    update.fontSize = 25;
    update.paddingBottom = '10px';
    main_ui.top_right.addControl(update);
    update.onPointerUpObservable.add(function(){
        fetch('http://localhost:3000/updateKeys', {
            method: 'POST',
            body: JSON.stringify(Object.assign(main_val, {drone: drone, frame: selected, preset: preset, address: main_ui.top_right_items.address.text})), // data can be `string` or {object}!
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            main_ani.keys = response;
            main_val.deg = response.command_values[drone][response.command_values[drone].length - 1].deg;
            //RE RENDER UI
            renderMainUI(drone, selected, true);
          })
          .catch(error => console.error('Error:', error));
    });

    //UI ACTIONS ITEMS
    //IP ADDRESS
    main_ui.top_right_items.address = new BABYLON.GUI.InputText();
    main_ui.top_right_items.address.width = 1;
    main_ui.top_right_items.address.height = "40px";
    main_ui.top_right_items.address.text = main_ani.keys.drone_address[drone];
    main_ui.top_right_items.address.color = gui_bg_color;
    main_ui.top_right_items.address.background = gui_txt_color;
    main_ui.top_right_items.address.focusedBackground = gui_txt_color;
    main_ui.top_right.addControl(main_ui.top_right_items.address);    
    //TXT DESCRIPTION
    main_ui.top_right_items.desc = new BABYLON.GUI.TextBlock();
    main_ui.top_right_items.desc.height = '120px';
    main_ui.top_right_items.desc.fontSize = 15;
    main_ui.top_right_items.desc.text = 'SELECT OPTION';
    main_ui.top_right.addControl(main_ui.top_right_items.desc);   


    //CREATE OPTIONS
    console.log(`LEN: ${main_ani.keys.command_values[drone].length} - DRONE ${drone} - SELECTED ${selected}`)
    if(selected > main_ani.keys.command_values[drone].length){
        selected = main_ani.keys.command_values[drone].length - 1;
    }    
    for(let i in options_1_3){
        main_ui.top_right_items.options[i] = addRadio(main_ani.keys.command_values[drone][selected].command, options_1_3[i], main_ui);
        //main_ui.top_right_items.options[i] = addRadio(main_ani.keys.drone_commands[main_val.drone][selected], options_1_3[i], main_ui);
    }
    //LOAD FRONE 0 ACTIONS
    for(let m in main_ani.keys.drone_commands[drone]){
        addActionListButton(main_ani.keys.drone_commands[drone][m], main_ui.top_left, m, drone, selected == m ? true : false, function (command, drone) {
        });
    }
    //renderActionDetails
    //UI SUB MENU
    main_ui.bottom_right = new BABYLON.GUI.StackPanel();
    main_ui.bottom_right.paddingTop = '30px';
    main_ui.bottom_right.paddingLeft = '10px';
    main_ui.bottom_right.height = '400px';
    main_ui.top_right.addControl(main_ui.bottom_right);




    return test;
}
function renderActionDetails(item, main_ui){
    main_ui.top_right_items.desc.text = item.desc;
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
    let not_clean = ['drone', 'deg'];
    //fruits.includes("Mango");
    for(let i in arr){
        if(!not_clean.includes(arr[i]) ){
            main_val[arr[i]] = 0;
        }        
    }
    //SET COMMAND TO MAIN_VAL
    main_val.command = item.command;
    //ADD NEW BOTTOM RIGHT ITEMS
    if(item.options.length > 0){
        for(let i in item.options){
            main_ui.bottom_right_items.push(createSlider(item.options[i].min, item.options[i].max, item.options[i].val, item.options[i].unit, item.options[i].max / 2, item.command, main_ui.bottom_right))
        }
    }
}
function renderBottomUI(drone){
    console.log(`DRONE renderBottomUI - ${drone}`)
    main_ui.bottom_panel = new BABYLON.GUI.StackPanel();
    main_ui.bottom_panel.isVertical = false;
    //main_ui.bottom_panel.bottom = '100px';
    main_ui.bottom_panel.width = 0.2;
    main_ui.bottom_panel.height = 0.05;
    main_ui.bottom_panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    main_ui.bottom_panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    main_ui.ui.addControl(main_ui.bottom_panel);

    main_ui.bottom_panel_items.txt = new BABYLON.GUI.TextBlock();
    //main_ui.bottom_panel_items.txt.height = '40px';
    main_ui.bottom_panel_items.txt.fontSize = 50;
    main_ui.bottom_panel_items.txt.width = '250px';
    main_ui.bottom_panel_items.txt.text = 'DRONE 1';
    main_ui.bottom_panel_items.txt.color = gui_color;
    //main_ui.bottom_panel_items.txt.paddingLeft = '10px';
    main_ui.bottom_panel_items.txt.paddingRight = '10px';
    //bottom_panel_items..verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    main_ui.bottom_panel.addControl(main_ui.bottom_panel_items.txt);
    main_ui.bottom_panel_items.add = addButton('+', '70px', main_ui.bottom_panel, false, function () {//ADD DRONE
        console.log('REMOVE DRONE ' + main_val.drone);            
        fetch('http://localhost:3000/addDronne', {
            method: 'POST',
            body: JSON.stringify(Object.assign(main_val, {drone: drone, preset: preset})), // data can be `string` or {object}!
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            main_ani.keys = response;
            main_val.deg = response.command_values[drone][response.command_values[drone].length - 1].deg;
            //RE RENDER UI
            renderMainUI(drone, main_ani.keys.drone_commands[drone].length - 1, false);
          })
          .catch(error => console.error('Error:', error));
    });
    if(main_ani.keys.drone_keys.length > 1){
        main_ui.bottom_panel_items.remove = addButton('-', '70px', main_ui.bottom_panel, false, function () {//REMOVE DRONE
            console.log('ADD DRONE ' + drone);            
            fetch('http://localhost:3000/removeDronne', {
                method: 'POST',
                body: JSON.stringify(Object.assign(main_val, {drone: drone, preset: preset})), // data can be `string` or {object}!
                headers:{'Content-Type': 'application/json' }
              }).then(res => res.json())
              .then(response => {
                //RE RENDER UI
                main_ani.keys = response;
                let last_drone = main_ani.keys.drone_commands.length;
                main_val.drone = last_drone - 1;
                drone = last_drone - 1;
                //UPDATE KEY VAR                
                main_val.deg = response.command_values[drone][response.command_values[drone].length - 1].deg;
                console.log(`DRONE ----- - ${drone}`)
                renderMainUI(drone, main_ani.keys.drone_commands[drone].length - 1, false);
              })
              .catch(error => console.error('Error:', error));
        });
    }
}
function renderTopUI(){
    main_ui.top_panel = new BABYLON.GUI.StackPanel();
    main_ui.top_panel.isVertical = false;
    main_ui.top_panel.top = 10;
    main_ui.ui.addControl(main_ui.top_panel);
    //PRESETS
    main_ui.top_panel_items.preset_a = addButton('A','70px', main_ui.top_panel, false, function () {//PASUE
        preset = 'A';
        fetch('http://localhost:3000/changePreset', {
            method: 'POST',
            body: JSON.stringify({preset: preset}),
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            main_val.drone = 0;
            main_ani.keys = response;
            main_val.deg = response.command_values[0][response.command_values[0].length - 1].deg;
            //RE RENDER UI
            renderMainUI(0, main_ani.keys.drone_commands[0].length - 1, false);
            
          })
          .catch(error => console.error('Error:', error));
    });
    main_ui.top_panel_items.preset_b = addButton('B','70px', main_ui.top_panel, false, function () {//PASUE
        preset = 'B';
        fetch('http://localhost:3000/changePreset', {
            method: 'POST',
            body: JSON.stringify({preset: preset}),
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            main_val.drone = 0;
            main_ani.keys = response;
            main_val.deg = response.command_values[0][response.command_values[0].length - 1].deg;
            //RE RENDER UI
            renderMainUI(0, main_ani.keys.drone_commands[0].length - 1, false);
          })
          .catch(error => console.error('Error:', error));
    });
    main_ui.top_panel_items.preset_c = addButton('C','70px', main_ui.top_panel, false, function () {//PASUE
        preset = 'C';
        fetch('http://localhost:3000/changePreset', {
            method: 'POST',
            body: JSON.stringify({preset: preset}),
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            //UPDATE KEY VAR
            selectedPreset(preset);
            main_val.drone = 0;
            main_ani.keys = response;
            main_val.deg = response.command_values[0][response.command_values[0].length - 1].deg;
            //RE RENDER UI
            renderMainUI(0, main_ani.keys.drone_commands[0].length - 1, false);
          })
          .catch(error => console.error('Error:', error));
    });
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

        //ADD UI BUTTONS
    main_ui.top_panel_items.reset = addButton('⟲', '70px', main_ui.top_panel, false, function () {//RESTART
        main_ani.group.restart();
        main_ani.group.reset();
    });
    main_ui.top_panel_items.play = addButton('▶', '70px', main_ui.top_panel, false, function () {//PLAY
        if(main_ani.keys.drone_keys[main_val.drone]['position'].keys.length > 1){
            main_ani.group.play(true);
        }
        else{
            alert('ERROR \nADD A NEW FRAME TO START THE ANIMATION');
        }
    });
    main_ui.top_panel_items.pause = addButton('❚❚','70px', main_ui.top_panel, false, function () {//PASUE
        main_ani.group.pause();
    });
    main_ui.top_panel_items.stop = addButton('▮','70px', main_ui.top_panel, false, function () {//PASUE
        main_ani.group.reset();
        main_ani.group.stop();
    });
    main_ui.top_panel_items.send = addButton('SEND', '140px', main_ui.top_panel, true, function () {
        //["command", "takeoff", "land", "takeoff", "go 32 34 34 50", "land", "takeoff", "7"]
        let drone_commands = main_ani.keys.drone_commands;
        let temp = {};
        for(let i in drone_commands){
            temp[main_ani.keys.drone_address[i]] = {cmd_list: drone_commands[i], status: {}};
        }
        fetch('http://localhost:3000/sendCommands', {
            method: 'POST',
            body: JSON.stringify(temp), // data can be `string` or {object}!
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            console.log(response);
          })
          .catch(error => console.error('Error:', error));
    });
    main_ui.top_panel_items.stop = addButton('⚠', '70px', main_ui.top_panel, true, function () {//STOP                      
        main_ani.group.reset();
        main_ani.group.stop();
        let drone_commands = main_ani.keys.drone_commands;
        let temp = {};
        for(let i in drone_commands){
            temp[main_ani.keys.drone_address[i]] = {cmd_list: ["emergency"], status: {}};
        }
        fetch('http://localhost:3000/sendCommands', {
            method: 'POST',
            body: JSON.stringify(temp), // data can be `string` or {object}!
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
          .then(response => {
            console.log(response);
          })
          .catch(error => console.error('Error:', error));
    });
}
function renderMainUI(drone, animation, play){
    console.log(`DRONE renderMainUI - ${drone}`)
    main_val.drone = drone;
    //RESTE ANIMATION
    timmer = false;
    main_ani.group.reset();
    main_ani.group.stop();
    main_ani.group.dispose();

    //RESET DRONE OBJ
    for(let j in main_obj.drones){
        main_obj.drones[j].dispose();
        main_obj.drones_gui[j].drone_ui.dispose();
    }
    main_obj.drones = [];
    main_obj.drones_gui = [];
    for(let i in main_ani.keys.drone_keys){
        main_obj.drones[i] = main_obj.model.clone('drone_' + i);
        main_obj.drones[i].position.x =+ main_obj.drones[i].position.x + (drone_separation * i);
        main_obj.drones[i].isVisible = true;
        main_obj.drones_gui[i] = addGUI(main_obj.drones[i], i);
    }
    //ADD ANIMATIONS
    addAnimations(main_ani.keys.drone_keys);
    //RESET TOP UI
    main_ui.top_panel.dispose();
    renderTopUI();
    //RESET BOTTOM UI
    main_ui.bottom_panel.dispose();
    renderBottomUI(drone);
    main_ui.bottom_panel_items.txt.text = `DRONE ${parseInt(drone, 0) + 1}`;
    if(main_ani.keys.drone_keys[main_val.drone]['position'].keys.length > 1){
        if(play) main_ani.group.play(true);
    }
    else{
        alert('ERROR \nADD A NEW FRAME TO START THE ANIMATION');
    }

    //RELOAD ACTION LIST
    main_ui.top_left.dispose();
    main_ui.top_left_trans.dispose();
    main_ui.top_right.dispose();
    main_ui.top_right_trans.dispose();
    renderActionList(animation,  drone);
    selectedPreset(preset);
}
function renderStats(){
    main_ui.stats = new BABYLON.GUI.StackPanel();  
    main_ui.stats.width = 0.25;
    main_ui.stats.height = 1;
    main_ui.stats.color = gui_txt_color;
    main_ui.stats.top = 10;
    main_ui.stats.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    main_ui.stats.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;         
    main_ui.ui.addControl(main_ui.stats);
    setInterval(function(){
        fetch('http://localhost:3000/getStatus', {
            method: 'POST',
            body: JSON.stringify({drone: main_ui.top_right_items.address.text, preset: preset}),
            headers:{'Content-Type': 'application/json' }
          }).then(res => res.json())
        .then(function(json) {
            let arr = Object.keys(json);
            //main_ui.stats.dispose();
            for(let i in main_ui.stats_items){
                main_ui.stats_items[i].dispose();
            }

            for(let i in arr){
                main_ui.stats_items[i] = new BABYLON.GUI.StackPanel();
                main_ui.stats_items[i].isVertical = false;
                main_ui.stats_items[i].height = '18px';
                main_ui.stats.addControl(main_ui.stats_items[i]);
                let label = new BABYLON.GUI.TextBlock();
                label.text = `${arr[i]}: ${json[arr[i]]}`;
                label.fontSize = 15;
                label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                label.width = '200px';
                label.color = gui_color;
                main_ui.stats_items[i].addControl(label);
            }
        });
    }, 500);
    //main_val.drone
}
function selectedPreset(preset){
    let a_bg = gui_color;
    let a_col = gui_bg_color;
    let b_bg = gui_color;
    let b_col = gui_bg_color;
    let c_bg = gui_color;
    let c_col = gui_bg_color;
    switch(preset){
        case "A":
            a_bg = gui_color;
            a_col = gui_bg_color;
            b_bg = gui_bg_color;
            b_col = gui_color;
            c_bg = gui_bg_color;
            c_col = gui_color;
            break;
        case "B":
            a_bg = gui_bg_color;
            a_col = gui_color;
            b_bg = gui_color;
            b_col = gui_bg_color;
            c_bg = gui_bg_color;
            c_col = gui_color;
            break;
        case "C":
            a_bg = gui_bg_color;
            a_col = gui_color;
            b_bg = gui_bg_color;
            b_col = gui_color;
            c_bg = gui_color;
            c_col = gui_bg_color;
            break;
        default:
            b_bg = gui_bg_color;
            b_col = gui_color;
            c_bg = gui_bg_color;
            c_col = gui_color;
    }
    main_ui.top_panel_items.preset_a.background = a_bg;
    main_ui.top_panel_items.preset_a.color = a_col;
    main_ui.top_panel_items.preset_b.background = b_bg;
    main_ui.top_panel_items.preset_b.color = b_col;
    main_ui.top_panel_items.preset_c.background = c_bg;
    main_ui.top_panel_items.preset_c.color = c_col;
}
//NEW

/*
//COMMANDS
    takeoff /8.7 SECONDS
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