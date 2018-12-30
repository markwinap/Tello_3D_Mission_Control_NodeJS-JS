var express = require('express')
var app = express()


app.get('/', function (req, res) {
  res.send('Hello World')
})
app.use('/static', express.static('public'))

app.listen(3000)