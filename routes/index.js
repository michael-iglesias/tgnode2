var Course = require('../models/Course.js');
/*
 * GET home page.
 */

exports.index = function(req, res){
	
	Course.listRandomCourses(function(err, featuredCourses) {
		if(err) throw err;
		
		res.render('index', { title: 'Technology Grows Courses', dataSet: {authenticatedUser: req.session.authenticatedUser, featuredCourses: featuredCourses} });		
	});
	
};

exports.create = function(req, res) {
    res.render('create', {title: 'Create New Service'});
};

exports.processCreation = function(req, res) {
    Service.addService(req, function(err, service) {
        if(err) throw err;
        res.redirect('/service');
    });
};