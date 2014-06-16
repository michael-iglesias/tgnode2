var db = require('../lib/db');

// Define User Schema
var UserSchema = new db.Schema({
    idURL: {type: String, unique: true},
    accountType: String
});

var User = db.mongoose.model('Account', UserSchema);

// Exports
module.exports.addUser = addUser;
module.exports.userLogin = userLogin;


function addUser(accountInfo, callback) {
    var instance = new User();
    instance.idURL = accountInfo['idURL'];
    instance.accountType = accountInfo['accountType'];
    
    instance.save(function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null, instance);
        }
    });
} // ***END addService()

function userLogin(accountHREF, callback) {
	User.findOne({idURL: accountHREF}, function(err, account) {
		if(err) {
			callback(err);
		} else {
			callback(null, account);
		}
	});
} // ***END userLogin()