'use strict';
var query = require('./js/query.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var serveFavicon = require('serve-favicon');
var server = require('http').createServer(app);
var port = process.env.PORT || 8888;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(bodyParser())
  .get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  })
  .use(express.static(__dirname + '/public'))
  .post('/login', function(req, res) {
    console.log(req.body.login+",  "+req.body.password);
    query("SELECT * FROM users WHERE login = '" + req.body.login + "' AND password = '" + req.body.password + "' LIMIT 1;", function(data) {
      if(data.length != 1) {
        res.json({success : false});
        return;
      }
      else {
        delete data[0].password;
        res.json({success : true, data : data[0]});
      }
    });
  })  
  .post('/profile', function(req, res) {
    query("SELECT * FROM users WHERE id = '" + req.body.id + "' LIMIT 1;", function(data) {
      if(data.length <= 0) {
        res.json({success : false});
        return;
      }
      else
        res.json({success : true, data : data[0]});
    });
  })
  .get('/tables', function(req, res) {
    query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';", function(data) {
      if(data.length <= 0) {
        res.json({success : false});
        return;
      }
      else {
        console.log(data);
        console.log("tables count= " + data.length);
        res.json({data : data});
      }
    });
  })
  .post('/rows',  function(req, res) {
    console.log(req.body.tableName);
    console.log(req.body.pageSize);
    console.log(req.body.offset);
    console.log("SELECT * FROM " + req.body.tableName + " LIMIT " + req.body.pageSize + " OFFSET " + req.body.offset + " ORDER BY " + 
    req.body.orderBy + " " + req.body.orderAsc +";");
    query("SELECT * FROM " + req.body.tableName + " ORDER BY " + req.body.orderBy + " " 
      + req.body.orderAsc + " LIMIT " + req.body.pageSize + " OFFSET " + req.body.offset + ";", function(data) {
      if(data.length < 0) {
        console.log(22222222);
        res.json({success : false});
        return;
      }
      else if(data.length == 0) {
        console.log(111111111);
        query("SELECT column_name FROM information_schema.columns WHERE table_name='" + req.body.tableName + "';", function(data) {
          console.log(data);
          res.json({success : true, data : data});
          //return;
        });
      }
      else {
        console.log(data);
        res.json({data : data});
      }
    });
  })
  .get('/rowsCount/:tableName',  function(req, res) {
    console.log(req.params.tableName);
    query("SELECT COUNT(*) FROM " + req.params.tableName + ";", function(data) {
      if(data.length <= 0) {
        res.json({success : false});
        return;
      }
      else {
        console.log(data);
        res.json({data : data});
      }
    });
  })
  .post('/addRow', function(req, res) {
    query("INSERT INTO " + req.body.name + " VALUES" + req.body.addStr, function(data) {
      if(data.length == 0) {
        res.json({success : true, data : data[0]});
        return;
      }
      else
        res.json({success : false});
    });
  })
  .post('/updateRow', function(req, res) {
    query("UPDATE " + req.body.name + " SET " + req.body.updStr + "WHERE id ='" + req.body.id + "'", function(data) {
      if(data.length == 0) {
        res.json({success : true, data : data[0]});
        return;
      }
      else
        res.json({success : false});
    });
  })
  .post('/deleteRow', function(req, res) {
    query("DELETE FROM " + req.body.name + " WHERE id ='" + req.body.id + "'", function(data) {
      if(data.length == 0) {
        res.json({success : true, data : data[0]});
        return;
      }
      else
        res.json({success : false});
    });
  })
