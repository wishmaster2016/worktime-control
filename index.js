'use strict';
var query = require('./js/query.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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
        res.json({data : data});
      }
    });
  })
  .post('/rows', function(req, res) {
    var where = "";
    var searchCols = req.body.searchCols;
    if(searchCols)
    {
      where += " WHERE ";
      for(var key in searchCols) {
        if(searchCols[key].length > 0) {
          where += "cast(" + key + " as text) LIKE '%" + searchCols[key] + "%' AND ";
        }
      }
      where = where.substring(0, where.length - 5);
    }
    query("SELECT * FROM " + req.body.tableName + where + " ORDER BY " + req.body.orderBy + " " 
      + req.body.orderAsc + " LIMIT " + req.body.pageSize + " OFFSET " + req.body.offset + ";", function(data) {
      if(data.length < 0) {
        res.json({success : false});
        return;
      }
      else if(data.length == 0) {
        query("SELECT column_name FROM information_schema.columns WHERE table_name='" + req.body.tableName + "';", function(data) {
          res.json({success : true, data : data});
        });
      }
      else {
        res.json({data : data});
      }
    });
  })
  .post('/rowsCount', function(req, res) {
    var where = "";
    var searchCols = req.body.searchCols;
    if(searchCols)
    {
      where += " WHERE ";
      for(var key in searchCols) {
        if(searchCols[key].length > 0) {
          where += "cast(" + key + " as text) LIKE '%" + searchCols[key] + "%' AND ";
        }
      }
      where = where.substring(0, where.length - 5);
    }
    query("SELECT COUNT(*) FROM " + req.body.tableName + where + ";", function(data) {
      if(data.length <= 0) {
        res.json({success : false});
        return;
      }
      else {
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
      else {
        res.json({success : false});
      }
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
