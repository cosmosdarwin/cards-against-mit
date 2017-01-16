// inserts the contents of blackcards.json and whitecards.json into a remote database in Azure
// run by simply typing "node bootstrap-deck.js" into the terminal

// filesystem api
var fs = require('fs');

// copy the connection string from the Azure portal
const connectionString = "mongodb://cards-against-mit:EUg4r8NC7Vvsr2NGbRGPmHEtylu6VJKGxchWCUmzfUdnTSTswcOcJS9kCLgNyzAOlUzsNz3b2gznIPGaM5W9wg==@cards-against-mit.documents.azure.com:10250/?ssl=true&sslverifycertificate=false";

// access remote database
const db = require("monk")(connectionString);

db.then(() => {

  console.log("Successfully connected to the remote database!");

  // create collections
  var WhiteCardCollection = db.create('whitecards');
  var BlackCardCollection = db.create('blackcards');
  console.log("Successfully created both collections!");

  // insert docs into collections...

  fs.readFile('blackcards.json', function (err, file) {
    if (err) {
        throw err;
    }
    // read the file and parse into json object(s)
    var blackCards = JSON.parse(file);
    for (var i = 0; i < blackCards.length; i++) {
      // insert each one into collection in the remote database
      BlackCardCollection.insert(blackCards[i]);
    }
    console.log("Successfully inserted all black cards!");
  });

  fs.readFile('whitecards.json', function (err, file) {
    if (err) {
        throw err;
    }
    // read the file and parse into json object(s)
    var whiteCards = JSON.parse(file);
    for (var i = 0; i < whiteCards.length; i++) {
      // insert each one into collection in the remote database
      BlackCardCollection.insert(whiteCards[i]);
    }
    console.log("Successfully inserted all white cards!");
  });

})