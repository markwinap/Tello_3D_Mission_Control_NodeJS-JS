const express = require('express');
const app = express();
const fs = require('fs');

const server_port = 3000;
 
fs.readFile('banner/_2', 'utf8', function(err, banner) {
    console.log(`
${banner}
OPEN THE FOLLOWING URL NN YOUR INTERNET BROWSER
http://localhost:${server_port}/

TO STOP THE SERVER USE
CTR+C

HAVE FUN :P
`);
});

//SERVER
app.use('/', express.static('public'));
app.get('/test', function (req, res) {
  res.send('Hello World');
});
app.listen(server_port);