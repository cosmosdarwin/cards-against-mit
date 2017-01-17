// inserts the contents of blackcards.json and whitecards.json into a remote database in Azure

// filesystem api
var fs = require('fs');

// copy the connection string from the Azure portal

const connectionString = "mongodb://cosmos-rehearsal:nIRhtrE4wkyBGayGmsxlbSWbJfiYINBvMNWcFEJ9OuKB2Ym6gqzafA7nT86FebGJDgFJLn9lXNVLiCq7zFkD7A==@cosmos-rehearsal.documents.azure.com:10250/cardsdatabase?ssl=true";

// access remote database
const db = require("monk")(connectionString);

db.then(() => {

  console.log("Successfully connected to the remote database!");

  // retrive collections

  var whiteCardCollection = db.get('whitecards');
  var blackCardCollection = db.get('blackcards');
  console.log("Successfully retrieved both collections!");

  // insert docs into collections...

  fs.readFile('json/blackcards.json', function (err, file) {
    if (err) {
        throw err;
    }
    var blackCards = JSON.parse(file); // read the file and parse into json object(s)
    blackCardCollection.insert(blackCards); // insert into collection
    console.log("Successfully inserted all black cards!");
  });

  fs.readFile('json/whitecards.json', function (err, file) {
    if (err) {
        throw err;
    }
    var whiteCards = JSON.parse(file); // read the file and parse into json object(s)
    whiteCardCollection.insert(whiteCards); // insert into collection
    console.log("Successfully inserted all white cards!");
  });

})