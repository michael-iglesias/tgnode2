var db = require('../lib/db');

// Define User Schema
var CourseSchema = new db.Schema({
    title: {type: String},
    technologies: [],
    author: { authorName: String, authorID: db.Schema.Types.ObjectId},
    courseType: String,
    courseMaxStudentCount: Number,
    description: String,
    staticView: {type: String, unique: true},
    imageURL: String,
    studentEnrollments: [{studentID: db.Schema.Types.ObjectId}]
});

var Course = db.mongoose.model('Course', CourseSchema);

// Exports
module.exports.addCourse = addCourse;
module.exports.listRandomCourses = listRandomCourses;
module.exports.getCourseInfo = getCourseInfo;
module.exports.getLatestCourses = getLatestCourses;
module.exports.courseSearch = courseSearch;
module.exports.registerStudent = registerStudent;
module.exports.getAllCourses = getAllCourses;




// Add course
function addCourse(courseInfo, callback) {
    var instance = new Course();
    instance.title = courseInfo.title;
    instance.technologies = courseInfo.technologies;
    instance.author.authorName = courseInfo.author.authorName;
    instance.author.authorID = courseInfo.author.authorID;
    instance.courseType = courseInfo.courseType;
    instance.courseMaxStudentCount = courseInfo.courseMaxStudentCount;
    instance.description = courseInfo.description;
    instance.staticView = courseInfo.staticView;
    instance.imageURL = courseInfo.imageURL;
    
    instance.save(function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null, instance);
        }
    });
} // ***END addService()

// List Featured courses
function listRandomCourses(callback) {
	Course.find().limit( 3 ).exec( function(err, randomCourses) {
		if(err) {
			callback(err);
		} else {
			callback(null, randomCourses);
		}
	});
} // ***END listRandomCourses()

// Get Latest Courses
function getLatestCourses(callback) {
	Course.find().skip(Course.count() - 3).exec( function(err, latestCourses) {
		if(err) {
			callback(err);
		} else {
			callback(null, latestCourses);
		}
	});
}

// Get courses by search query
function courseSearch(query, callback) {
	Course.find({ $or: [{title: new RegExp(query, 'i')}, {technologies: new RegExp(query, 'i')}, {'author.authorName': new RegExp(query, 'i')} ]}).exec( function(err, searchResults) {
		if(err) {
			callback(err);
		} else {
			callback(null, searchResults);
		}
	});
}

function getAllCourses(callback) {
	Course.find({}).exec( function(err, results) {
		if(err) {
			callback(err);
		} else {
			callback(null, results);
		}
	});
}

// Get Course Info by ID
function getCourseInfo(id, callback) {
	Course.findById(id, function(err, course) {
		if(err) {
			callback(err);
		} else {
			callback(null, course);
		}
	});
}

function registerStudent(info, callback) {
	Course.update(
	    { _id: info.course },
	    { $push: { studentEnrollments: {studentID: info.student } } }
	  ).exec(function(err, record) {
		  if(err) {
			  callback(err);
		  } else {
			  callback(null, record);
		  }
	  });
}