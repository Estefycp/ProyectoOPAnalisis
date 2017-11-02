var express = require('express');
var app = express();
app.listen(9000);

app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
  });

app.use(express.static('todo'));


console.log("Servidor Express escuchando en modo %s", app.settings.env);
