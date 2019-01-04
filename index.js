const express = require('express');
const app = express();
const fs = require('fs');
const colors = require('colors');

const server_port = 3000;
 
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
app.listen(server_port);