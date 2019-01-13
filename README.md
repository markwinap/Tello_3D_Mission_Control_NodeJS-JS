# TELLO_MISSION_CONTROL_AND_SERVER


### INSTALL
npm install

### START SERVER
npm start

### Open Internet Browser (3D UI)
http://localhost:3000/static/

### SEND COMMANDS (NO UI REQUIRED)

**URL**
http://localhost:3000/sendCommands

**METHOD**
POST

**BODY FOR SINGLE DRONE**
```js
{
  "192.168.10.1": {
    "cmd_list" : ["command", "takeoff", "5", "land"],
    "status": {}
  }
}
```
**BODY FOR MULTI DRONE**
```js
{
  "192.168.10.1": {
    "cmd_list" : ["command", "takeoff", "5", "land"],
    "status": {}
  },
  "192.168.10.2": {
    "cmd_list" : ["command", "takeoff", "5", "land"],
    "status": {}
  }
}
```

### RECEIVE DRONE STATUS (NO UI REQUIRED)

**URL**
http://localhost:3000/getStatus

**METHOD**
POST

**BODY**
```js
{
  "drone": "192.168.10.1"
}
```

## POSTMAN COLLECTION

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/ba072580a0109d09477a)


## FEATURES

- 3D UI
- Drone Animations To Better Represent End Result
- Multi Drone Support
- Stand-alone server for sending commands



## UDP COMANDS SDK 1.3
UDP commands sent to Tello Drone 192.168.10.1:8889
UDP messages response on 0.0.0.0:8889

| COMMAND | DEFINITION | NOTES | EXAMPLE | RESPONSE |
| ------ | ------ | ------ | ------ | ------ |
| command | Enable command mode | Required before sending drone commands | command | ok, error |
| takeoff | Start Drone motors and takeoff | Takeoff and go to ~60-90 cm height | takeoff | ok, error |
| land | Land the Drone and stop the motors | ~50cm/s land speed | land | ok, error |
| emergency | Stop motors | Use for emergency stop | emergency | ok, error |
| up x | Go up 20 - 500 | Centimeters - Imput lower than 20 will get ignored | up 10 | ok, error |
| down x | Go down 20 - 500 | Centimeters - Imput lower than 20 will get ignored | down 10 | ok, error |
| left x | Go left 20 - 500 | Centimeters - Imput lower than 20 will get ignored | left 10 | ok, error |
| right x | Go right 20 - 500 | Centimeters - Imput lower than 20 will get ignored | right 10 | ok, error |
| forward x | Go forward 20 - 500 | Centimeters - Imput lower than 20 will get ignored | forward 10 | ok, error |
| back x | Go backward 20 - 500 | Centimeters - Imput lower than 20 will gw 180 | ok, error |
| flip x | Flip drone to the left, right, forward or backward | Possible inputs (l, r, f b) | flip f | ok, error |
| go x y z speed | Go Forward or Backward, Left or Rigth, Up or Down  | X: -500 - 500, Y: -500 - 50et ignored | back 10 | ok, error |
| cw x | Rotate drone clockwise 1-360 | Degrees | Degrees | ccw 180 | ok, error |
| ccw x | Rotate drone counterclockwise 1-360 | Degrees | ccw 180 | ok, error |



# STATS SDK 1.3
Receive drone stats UDP messages on 0.0.0.0:8890

**FORMAT**
pitch:%d;roll:%d;yaw:%d;vgx:%d;vgy%d;vgz:%d;templ:%d;temph:%d;tof:%d;h:%d;bat:%d;baro: %.2f; time:%d;agx:%.2f;agy:%.2f;agz:%.2f;\r\n

**Sample Mesage**
mid:257;x:0;y:0;z:0;mpry:0,0,0;pitch:0;roll:0;yaw:-20;vgx:0;vgy:0;vgz:0;templ:66;temph:69;tof:10;h:0;bat:67;baro:1687.34;time:16;agx:6.00;agy:0.00;agz:-999.00;


### UDP Message Definitions - SDK 1.3

| KEY | DEFINITION | SAMPLE VALUE |
| ------ | ------ | ------ |
| mid | ? | 257 |
| x | Not in use | 0 |
| y | Not in use | 0 |
| z | Not in use | 0 |
| pitch | Drone pitch inclination to move forward or backward | 10 |
| roll | Drone roll inclination to left or right | 10 |
| yaw | Drone rotation clockwise or counterclockwise | -20 |
| vgx | Speed Of X Axis | 0 |
| vgy | Speed Of Y Axis | 0 |
| vgz | Speed Of Z Axis | 0 |
| templ | Low Average Temperature in C | 65 |
| temph | Max Average Temperature in C | 65 |
| tof | Time Of Fligth Distance | 10 |
| h | Height (cm) | 10 |
| bat | Battery (%) | 67 |
| baro | Meters above sea level (Meters) | 1687.34 |
| agx |  Acceleration X (0.001g) | 6.00 |
| agy |  Acceleration Y (0.001g) | 0.00 |
| agz |  Acceleration Z (0.001g) | -999.00 |

#### VIDEO

[![](http://img.youtube.com/vi/qmhspfHoPQU/0.jpg)](https://youtu.be/2-PPhzb_R8M "TELLODJI Tello - 3D Mission Control - WIP - Day 7")


### ADITIONAL CREDITS
DRONE ICON FILE - https://www.iconfinder.com/icons/2633199/camera_drone_helicopter_spy_technology_icon

