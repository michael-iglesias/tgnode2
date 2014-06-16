var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

connect();

function connect() {
	var url = 'mongodb://nikita:nikitaizraw311@kahana.mongohq.com:10020/tg';
	mongoose.connect(url);
}

function disconnect() {
	mongoose.disconnect;
}