// logs the contents of the 'whitecards' and 'blackcards' collections of the remote database to the console

// copy the connection string from the Azure portal
const connectionString = "mongodb://cards-against-mit:EUg4r8NC7Vvsr2NGbRGPmHEtylu6VJKGxchWCUmzfUdnTSTswcOcJS9kCLgNyzAOlUzsNz3b2gznIPGaM5W9wg==@cards-against-mit.documents.azure.com:10250/cardsdatabase?ssl=true&sslverifycertificate=false";

// access remote database
const db = require("monk")(connectionString);

var whiteCardCollection = db.get('whitecards');
var blackCardCollection = db.get('blackcards');

blackCardCollection.find({}).then((blackCards) => {
	console.log(blackCards);
});

whiteCardCollection.find({}).then((whiteCards) => {
	console.log(whiteCards);
});