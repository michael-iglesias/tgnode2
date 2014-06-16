var User = require('../models/User.js');
var Course = require('../models/Course.js');
var stormpath = require('stormpath');

// Services Configuration
//In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
var apiKeyStormpath = new stormpath.ApiKey('64I5QZB22GYI6A67ANS5JRV2H', 'btiFlmHS4cyZBdkm/CeD8hsRhmAgTw10qmDLr91VAYQ');
var stormpathClient = new stormpath.Client({apiKey: apiKeyStormpath});
var stormpathAppInst = null;




// **************************************
// ** user Registration Form
// **************************************
exports.userRegistration = function(req, res) {
	res.render('userAccounts/userRegistration', {layout: false, title: 'User Registration', dataSet: { errors: null} });
};

// **************************************
// ** Process user Creation
// **************************************
exports.createUser = function(req, res) {
	
	if (!req.form.isValid) {
		res.render('userAccounts/userRegistration', {layout: false, title: 'user Registration', dataSet: { errors: req.form.errors} });
	} else {
		var account = {
		  givenName: req.body.fname,
		  surname: req.body.lname,
		  email: req.body.email,
		  phone: req.body.phone,
		  password: req.body.pass
		};
		
		stormpathClient.getApplication('https://api.stormpath.com/v1/applications/5eogljoxib0kuJg0e838yE', function (err, stormpathApp) {
			if (err) throw err;
		  
			stormpathApp.createAccount(account, function onAccountCreated(err, createdAccount) {
				if (err) throw err;
				// Account was created, now add newly created account to "user" group
				createdAccount.addToGroup('https://api.stormpath.com/v1/groups/6Tiluc3M5CAdKfVsV0LmzW', function onMembershipCreated(err, membership) {
					if (err) throw err;
				});
				// Set stormpath app instance = stormPathAppInst variable
				stormpathAppInst = stormpathApp;
				// Insert Created User into Propertly DB
				var userDB = {};
				userDB['idURL'] = createdAccount.href;
				userDB['accountType'] = 'user';
				
				User.addUser(userDB, function(err, userCreatedDB) {
					if(err) throw err;
					
					var pid = userCreatedDB._id;
					var accountType = userCreatedDB.accountType;
					
					req.session.pid = pid;
					req.session.accountType = accountType;
					
					console.log(req.session);
					res.redirect('/user/login');
				});
			});
		});
	}
}; // ***END createuser

// **************************************
// ** Display user Login Form
// **************************************
exports.userLogin = function(req, res) {
  	res.render('userAccounts/userLogin', {layout: false, title: 'user Login'});
};

// **************************************
// ** Process user Login
// **************************************
exports.userProcessLogin = function(req, res) {
	var authcRequest = {
		username: req.body.userEmail,
		password: req.body.userPass
	};

	stormpathClient.getApplication('https://api.stormpath.com/v1/applications/5eogljoxib0kuJg0e838yE', function (err, stormpathApp) {
		if (err) throw err;	
		stormpathApp.authenticateAccount(authcRequest, function onAuthcResult(err, result) {
			if(err) {
				res.render('userAccounts/userFailedLogin', {layout: false, title: 'user Login'});			
			} else {
				result.getAccount(function(err, account) {
					if(err) throw err;
					
					User.userLogin(account.href, function(err, userAccount) {
						req.session.pid = userAccount._id;
						req.session.accountType = userAccount.accountType;
						req.session.authenticatedUser = true;
						
						if(req.session.redirectAfterLogin) {
							var courseID = req.session.redirectAfterLogin;
							req.session.redirectAfterLogin = null;
							res.redirect('/course/' + courseID);
						} else {
							res.redirect('/user/home');							
						}

					});
				});
			}
		});
	});	
};

// **************************************
// ** user Homepage
// **************************************
exports.userHome = function(req, res) {
	console.log(req.session);
	res.render('userAccounts/authenticatedUser/userHome', {layout: 'layoutLoggedinUser', title: 'User Dashboard', dataSet: {authenticatedUser: req.session.authenticatedUser} });
};

// **************************************
// ** List Course landing page
// **************************************
exports.courseHome = function(req, res) {
	Course.getLatestCourses(function(err, latestCourses) {
		Course.listRandomCourses(function(err, featuredCourses) {
			if(err) throw err;
			
			res.render('courseHome', { title: 'Technology Grows Courses', dataSet: {authenticatedUser: req.session.authenticatedUser, latestCourses: latestCourses, featuredCourses: featuredCourses} });		
		});
	});
};


exports.courseSearch = function(req, res) {
	var q = req.body.q;
	console.log(q);
	Course.courseSearch(q, function(err, searchResults) {
		console.log(searchResults);
		res.render('courseSearch', { title: 'Technology Grows Course Search', dataSet: {authenticatedUser: req.session.authenticatedUser, searchResults: searchResults} });
	});
};

exports.allCourses = function(req, res) {
	Course.getAllCourses(function(err, searchResults) {
		res.render('courseSearch', { title: 'Technology Grows Course List', dataSet: {authenticatedUser: req.session.authenticatedUser, searchResults: searchResults} });
	});		
};

// **************************************
// ** Course by ID info page
// **************************************
exports.getCourseInfo = function(req, res) {
	req.session.redirectAfterLogin = req.params.id;
	
	Course.getCourseInfo(req.params.id, function(err, course) {
		res.render('courses/' + course.staticView, {layout: 'courseLayout', title: course.title, dataSet: {authenticatedUser: req.session.authenticatedUser, course: course, studentEnrollmentsCount: course.studentEnrollments.length, enrollmentDiff: course.courseMaxStudentCount -  course.studentEnrollments.length} });
	});
};

// **************************************
// ** Course by ID info page
// **************************************
exports.registerStudent = function(req, res) {
	Course.getCourseInfo(req.body.courseID, function(err, course) {
		// Iterate through enrollments to make sure user has not already registered for this same course
			var alreadyRegistered = false;
			course.studentEnrollments.forEach( function(e) {
				if(e.studentID == req.session.pid) {
					alreadyRegistered = true;
				}
			}); 
			console.log(alreadyRegistered);
			
			var info = {
				course: course._id,
				student: req.session.pid
			}
			if(course.studentEnrollments.length < course.courseMaxStudentCount && alreadyRegistered === false) {
				Course.registerStudent(info, function(err, registration) {
					if(err) {
						throw err;
					} else {
						res.json({status: "success", description: "You have successfully registered for this course. The course has been added to your schedule!"})
					}
				});
			} else if(alreadyRegistered === true){
				res.json({status: "error", description: "You are already registered for this course."})
			} else {
				res.json({status: "error", description: "No seats available."})
			}
	});
};