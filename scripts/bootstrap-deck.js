// inserts the contents of blackcards.json and whitecards.json into a remote database in Azure

// filesystem api
var fs = require('fs');

// copy the connection string from the Azure portal
const connectionString = "mongodb://cards-against-mit:EUg4r8NC7Vvsr2NGbRGPmHEtylu6VJKGxchWCUmzfUdnTSTswcOcJS9kCLgNyzAOlUzsNz3b2gznIPGaM5W9wg==@cards-against-mit.documents.azure.com:10250/cardsdatabase?ssl=true&sslverifycertificate=false";

// access remote database
const db = require("monk")(connectionString);

db.then(() => {

  console.log("Successfully connected to the remote database!");

  // retrive collections

  var whiteCardCollection = db.get('whitecards');
  var blackCardCollection = db.get('blackcards');
  console.log("Successfully retrieved both collections!");

  // insert docs into collections...

  fs.readFile('data/blackcards.json', function (err, file) {
    if (err) {
        throw err;
    }
    var blackCards = JSON.parse(file); // read the file and parse into json object(s)
    blackCardCollection.insert(blackCards); // insert into collection
    console.log("Successfully inserted all black cards!");
  });

  fs.readFile('data/whitecards.json', function (err, file) {
    if (err) {
        throw err;
    }
    var whiteCards = JSON.parse(file); // read the file and parse into json object(s)
    whiteCardCollection.insert(whiteCards); // insert into collection
    console.log("Successfully inserted all white cards!");
  });

})