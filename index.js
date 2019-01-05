const express = require('express');
const app = express();
const fs = require('fs');
const colors = require('colors');
const bodyParser = require('body-parser')
const server_port = 3000;

const frame_rate = 60;

const jsonParser = bodyParser.json();
 
fs.readFile('banner/_2', 'utf8', function(err, banner) {
  console.log(banner.cyan);
  console.log('OPEN THE FOLLOWING URL NN YOUR INTERNET BROWSER'.white);
  console.log(`http://localhost:${server_port}/\n`.inverse);
  console.log('TO STOP THE SERVER USE'.white);
  console.log(`CTR+C\n`.inverse);
  console.log('HAVE FUN :P'.cyan);
});

//SERVER
app.use('/', express.static('public'));
app.get('/test', function (req, res) {
  res.send('Hello World');
});

//GET REQUEST

app.get('/getKeys', function (req, res) {
  fs.readFile('keys.json', 'utf8', (err, file) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('myfile does not exist');
        return;
      }
      throw err;
    }
    res.send(file)
  });
});
//ADD NEW KEY
app.post('/addKeys', jsonParser, function (req, res) {
  fs.readFile('keys.json', 'utf8', (err, keys) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('myfile does not exist');
        return;
      }
      throw err;
    }
    else{
      let keysObj = JSON.parse(keys);
      let drone = req.body.drone;
      keysObj.command_values[drone].push(req.body);
      keysObj.drone_commands[drone].push(getCommand(req.body));
      keysObj.drone_keys[drone] = getFrames(keysObj.drone_keys[drone], req.body);
      //JSON UPDATE & RESPONSE
      let KeysJSON = JSON.stringify(keysObj);
      fs.writeFile('keys.json', KeysJSON, (err) => {
        if (err) throw err;
        else{
          res.send(KeysJSON);
        }
      });
    }
  });
});
//UPDATE KEYS
app.post('/updateKeys', jsonParser, function (req, res) {
  fs.readFile('keys.json', 'utf8', (err, keys) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('myfile does not exist');
        return;
      }
      throw err;
    }
    else{
      let keysObj = JSON.parse(keys);
      let drone = req.body.drone;
      let frame = req.body.frame;

      keysObj.command_values[drone][frame] = req.body;
      keysObj.drone_commands[drone][frame] = getCommand(req.body);  
      keysObj.drone_keys[drone] = [];
      for(let n in keysObj.command_values[drone]){
        keysObj.drone_keys[drone] = getFrames(keysObj.drone_keys[drone], keysObj.command_values[drone][n]);// PENDING
      }
      //JSON UPDATE & RESPONSE
      let KeysJSON = JSON.stringify(keysObj);
      fs.writeFile('keys.json', KeysJSON, (err) => {
        if (err) throw err;
        else{
          res.send(KeysJSON);
        }
      });
    }
  });
});
//DELETE KEYS
app.post('/deleteKeys', jsonParser, function (req, res) {
  fs.readFile('keys.json', 'utf8', (err, keys) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('myfile does not exist');
        return;
      }
      throw err;
    }
    else{
      let keysObj = JSON.parse(keys);
      let drone = req.body.drone;
      let frame = req.body.frame;

      keysObj.command_values[drone].splice(frame, 1);
      keysObj.drone_commands[drone].splice(frame, 1);
      keysObj.drone_keys[drone] = [];
      for(let n in keysObj.command_values[drone]){
        keysObj.drone_keys[drone] = getFrames(keysObj.drone_keys[drone], keysObj.command_values[drone][n]);// PENDING
      }
      //JSON UPDATE & RESPONSE
      let KeysJSON = JSON.stringify(keysObj);
      fs.writeFile('keys.json', KeysJSON, (err) => {
        if (err) throw err;
        else{
          res.send(KeysJSON);
        }
      });
    }
  });
});

app.listen(server_port);


//ANNIMATION FUNCTIONS
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
  if(keys.length == 0){
      keys.push({type: 'position',ani_type: 'ANIMATIONTYPE_VECTOR3',ani_mode: 'ANIMATIONLOOPMODE_CYCLE',keys: [{frame: 0,value: {x: 0,y: 0,z: 0}}]});
      return keys;
  }
  let speed = 50;
  let anim_type = getFrameType(values.command);
  let last_frame_type = keys[keys.length -1];
  let last_frame = last_frame_type.keys[last_frame_type.keys.length -1];
  switch(values.command) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
      case 'forward':
      case 'back':
      case 'go':
          if(last_frame_type.type == anim_type.type){
              let dest = {x: 50, y: 50, z: 50};
              keys[keys.length -1].keys.push({frame: last_frame.frame + (frame_rate * getFrameDuration(speed, last_frame.value, dest)), value: dest});
          }
          else{
              console.log('FALSE')
          }
          break;
      case 'takeoff':
          if(last_frame_type.type == anim_type.type){
              let dest = {x: last_frame.value.x, y: 40, z: last_frame.value.z};
              keys[keys.length -1].keys.push({frame: last_frame.frame + (frame_rate * getFrameDuration(speed, last_frame.value, dest)), value: dest});
          }
          else{
              console.log('FALSE')
          }
          break
      case 'land':
          if(last_frame_type.type == anim_type.type){
              let dest = {x: last_frame.value.x, y: 0, z: last_frame.value.z};
              keys[keys.length -1].keys.push({frame: last_frame.frame + (frame_rate * getFrameDuration(speed, last_frame.value, dest)), value: dest});
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
      case 'command':
          if(last_frame_type.type == anim_type.type){
            //TODO:
              keys[keys.length -1].keys.push({frame: last_frame.frame + (frame_rate * getFrameDuration(0, last_frame.value, last_frame.value)), value: last_frame.value});
          }
          else{
            console.log('FALSE')
          }
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
      case 'command':
          return {type: 'position', ani_type: 'ANIMATIONTYPE_VECTOR3',ani_mode: 'ANIMATIONLOOPMODE_CYCLE'};
          break;
      case 'flip':
          //return `${values.command} ${values.dir}`;
          break;
      case 'curve':
          //return `${values.command} ${values.x1} ${values.y1} ${values.z1} ${values.x2} ${values.y2} ${values.z2} ${values.speed}`;
          break;
      default:
          return command;
  }
}