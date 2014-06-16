
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var routes = require('./routes');
var userRoutes = require('./routes/account.js');
var partials = require('express-partials');
var http = require('http'), util = require('util');
var path = require('path'), 
	form = require("express-form"),
    filter = form.filter,
    validate = form.validate;
var stormpath = require('stormpath');

var Course = require('./models/Course');



// configure Express
// all environments
app.use(partials());
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session( {secret: '123123'} ));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', routes.index);
app.get('/add', function(req, res) {
	var course = {
	    title: 'Intro to Machine Learning',
	    technologies: ['hadoop', 'matlab', 'python', 'machine learning', 'data mining', 'ocr'],
	    author: { authorName: 'Ryan Whitney' },
	    courseType: 'inperson',
	    courseMaxStudentCount: 15,
	    description: 'long course description',
	    staticView: 'intro-machine-learning',
	    imageURL: 'https://udemyimages-a.akamaihd.net/course/240x135/144348_8e56_2.jpg'
    };
    
    Course.addCourse(course, function(err, createdCourse) {
	    console.log(createdCourse);
    });
    
	var course = {
	    title: 'Intro to Node.js',
	    technologies: ['node', 'javascript', 'durandal', 'knockout', 'mongodb', 'express'],
	    author: { authorName: 'Michael iglesias' },
	    courseType: 'inperson',
	    courseMaxStudentCount: 15,
	    description: 'Introduction to Node.js using several industry leading technologies',
	    staticView: 'intro-nodejs',
	    imageURL: 'https://udemyimages-a.akamaihd.net/course/240x135/18072_c62f_13.jpg'
    };
    
    Course.addCourse(course, function(err, createdCourse) {
	    console.log(createdCourse);
    });
    
	var course = {
	    title: '.NET Fast Track',
	    technologies: ['.net', 'csharp', 'c#', 'mvc', 'web api', 'microsoft', 'sql server'],
	    author: { authorName: 'Chris Dietz' },
	    courseType: 'inperson',
	    courseMaxStudentCount: 15,
	    description: '.NET Fast Track - Become a full stack engineer.',
	    staticView: 'net-fastrack',
	    imageURL: 'https://udemyimages-a.akamaihd.net/course/240x135/106856_0edc_4.jpg'
    };
    
    Course.addCourse(course, function(err, createdCourse) {
	    console.log(createdCourse);
    });
});

app.get('/list', function(req, res) {
	Course.listRandomCourses(null, function(err, randomCourses) {
		console.log(randomCourses);
	});
});


app.get('/test', function(req, res) {
	req.session.authenticatedUser = false;
	res.redirect('/');
});

// User Requests
app.get('/user/register', userRoutes.userRegistration); // Display registration form
app.post('/user/create', form( validate("fname", "First Name").required("First Name is Required"), validate("lname", "Last Name").required("Last Name is Required"), validate("email", "Email Address").required("Email is Required").isEmail(), validate("phone", "Phone Number").required().custom(function(value) { if(value.length != 10) {throw new Error("Phone number must be 10 digits with no special characters!")} }), validate("pass", "Password").required().custom(function(value) { if(value.length < 6 || value.length > 25) throw new Error("Password must be between 7 and 25 characters long!") }) ), userRoutes.createUser); // Process registration form

app.get('/user/login/:redirect?', userRoutes.userLogin);
app.post('/user/login/process', userRoutes.userProcessLogin);
app.get('/user/home', requireuserLogin, userRoutes.userHome);

// Course Endpoints
app.get('/courses', userRoutes.courseHome);
app.get('/courses/all', userRoutes.allCourses);
app.post('/course/search', userRoutes.courseSearch);
app.get('/course/search', function(req, res) {
	res.render('courseSearch', { title: 'Technology Grows Course Search', dataSet: {searchResults: null} });
});
app.get('/course/:id', userRoutes.getCourseInfo);
app.post('/course/register', userRoutes.registerStudent);
app.get('/enrollment_success', function(req, res) {
	res.render('enrollmentSuccess', {layout: true, title: 'Successfully Enrolled'});
});





//************************************************
// Misc. functions
//************************************************


function requireuserLogin(req, res, next) {
  if (req.session.authenticatedUser && req.session.accountType == 'user') {
    next(); // allow the next route to run
  } else {
    // require the user to log in
    res.redirect("/user/login"); // or render a form, etc.
  }
}

function requireTenementLogin(req, res, next) {
	if(req.session.authenticatedUser && req.session.accountType == 'property_sh') {
		next();
	} else {
		res.redirect("/tenement/login");
	}
} 


app.listen(3000, "localhost");
//app.listen(process.env.PORT);