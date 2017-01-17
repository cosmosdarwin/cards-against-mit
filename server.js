// Express Framework
var express = require('express');
var app = express();

// Jade Templating Engine
var jade = require('jade');
app.set('view engine', 'jade');

// Mongo Database
var mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

const connectionString = "mongodb://cosmos-rehearsal:DCH0cL8G2AyOKzbQ1Kvl2yDncDlftaQPdTm5pZb7BJLQX5USe93pDyQpP0iDrfFjOMS53zV597TmGNV28qQrBA==@cosmos-rehearsal.documents.azure.com:10250/cardsdatabase?ssl=true";

const db = require("monk")(connectionString);

// MIDDLEWARE

var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(express.static('public'));

// FUNCTIONS

function findRandom(collection, callback) {
  collection.count({}, function(e, count) {
    if (e) { throw e; } else {
      var n = Math.floor(Math.random() * count);
      collection.find({}, {}, function(e, docs) {
        if (e) { throw e; } else {
          callback(null, docs[n]);
          return;
        }
      });
    }
  });
}

function initialHand(partialHand, callback) {
  var hand = partialHand;
  if (Object.keys(hand).length == 10) {
    // Return
    callback(null, hand);
    return;
  }
  else {
    var collection = db.get('whitecards');
    findRandom(collection, function(e, whitecard) {
      if (e) { throw e; } else {
        if (whitecard._id in hand) {
          // Skip
        }
        else {
          hand[whitecard._id] = whitecard;
        }
        initialHand(hand, callback); // Recurse
      }
    });
  }
}

function refillHand(hand, blue, draw, callback) {
  if (Object.keys(draw).length == Object.keys(blue).length) {
    // Return
    callback(null, draw);
    return;
  }
  else {
    var collection = db.get('whitecards');
    findRandom(collection, function(e, whitecard) {
      if (e) { throw e; } else {
        if (whitecard._id in hand) {
          // Skip
        }
        else {
          draw[whitecard._id] = whitecard;
        }
        refillHand(hand, blue, draw, callback); // Recurse
      }
    });
  }
}

function newBlack(oldBlack, callback) {
  var collection = db.get('blackcards');
  findRandom(collection, function(e, blackcard) {
    if (e) { throw e; } else {
      if (blackcard._id == oldBlack._id) {
        // Skip
      }
      else {
        callback(null, blackcard);
        return;
      }
      newBlack(oldBlack, callback); // Recurse
    }
  });
}

function createPairing(black, blue) {
  if (Object.keys(blue).length == black.blanks) {
    var course = black.course;
    var blackfrags = black.string.split("_____");
    var whitefrags = [];
    for (var id in blue) {
      whitefrags.push(blue[id].string);
    }
    var pairings = db.get('pairings');
    pairings.insert({ "course" : course, "blackfrags" : blackfrags, "whitefrags" : whitefrags, "votes" : 0 })
  }
  else {
    // Invalid
  }
}

// ROUTES

app.get('/', function(req, res) {
  res.redirect('/play');
});

app.get('/play', function(req, res) {
    res.render('play');
});

app.get('/billboard', function(req, res) {
    res.render('billboard');
});

app.get('/sort', function(req, res) {
  var collection = db.get('pairings');
  collection.find({}, {sort: {votes: 1}}, function(e, docs) {
    if (e) { throw e; } else {
      var pairings = [];
      docs.reverse().forEach(function(pairing) { // reverse for decreasing order
        pairings.push(pairing);
      });
      res.send({"pairings" : pairings });
    }
  });
});

app.get('/initial', function(req, res) {
  var emptyHand = {};
  initialHand(emptyHand, function(e, hand) {
    console.log("Initial hand of white cards assembled.");
    var blankBlack = { _id : null }; // to be replaced
    newBlack(blankBlack, function(e, black){
      console.log("Initial black card selected.");
      res.send({"hand" : hand, "black" : black });
    });
  });
});

app.post('/submit', function(req, res) {
  var hand = req.body.hand;
  var blue = req.body.blue;
  var draw = {}; // to be filled
  refillHand(hand, blue, draw, function(e, draw) {
    console.log("Hand of white cards refilled.");
    var black = req.body.black;
    newBlack(black, function(e, newBlack){
      console.log("New black card selected.");
      res.send({"draw" : draw, "newBlack" : newBlack });
      // Insert Pairing
      createPairing(black, blue);
    });
  });
});

app.post('/upvote', function(req, res) {
  var id = req.body.id;
  var collection = db.get('pairings');
  collection.findById( new ObjectID(id) , {}, function(e, pairing) {
    if (e) { throw e; } else {
      pairing.votes += 1;
      collection.update( new ObjectID(id), pairing, function(e) {
        if (e) { throw e; } else {
          res.sendStatus(200);
        }
      });
    }
  });
});

// 404

app.use(function(req, res, next) {
	res.setHeader('Content-Type', 'text/html');
	res.send(404, 'You are lost.');
});

// RUN

// app.listen(80);

if (process.env.NODE_ENV == "production") {
  // in Azure cloud
  app.listen(process.env.PORT);
}
else {
  // local
  app.listen(80);
}