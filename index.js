const express = require('express');
const app = express();
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "med_user",
  password: "analisis",
  database: "med"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  // var sql = "CREATE TABLE test (name VARCHAR(255), address VARCHAR(255))";
  // var sql = "INSERT INTO test (name, address) VALUES ('Andres', 'Barro')";
  var sql = "SELECT * from test;";
  // var sql = "DELETE FROM test WHERE address = 'Barro'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });
