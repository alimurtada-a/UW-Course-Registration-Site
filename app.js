/**
 * Name: Tianmeng Wang and Ali
 * Date: Dec 2nd, 2021
 * Section: CSE 154 AF, TA: Austin Jenchi and Tara Wueger
 *
 * This is the app.js main entry on the backend for the course API. The course API provides user
 * with different data based upon the route. The possible endpoints funcionality are described in
 * the API documentation.
 */
'use strict';

const express = require('express');
const multer = require('multer');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const cookieParser = require("cookie-parser");
const app = express();
const PORT_NUM = 8000;
const BAD_REQ_CODE = 400;
const SERVER_ERR_CODE = 500;
const SERVER_ERR_MSG = "Server is down for now, don't try again.";
const INVALID_COURSE_MSG = "Course does not exist.";
const INVALID_USER_MSG = "User does not exist.";
const MISSING_PARAM_MSG = "One or more parameter is missing.";
const BAD_REGIS_MSG = "Course is already registered.";
const BAD_REGIS_PLAN_MSG = "One or more courses in the plan is already registered.";
const SUCCESS_REGIS_MSG = "Course is successfully registered. Registration code: ";
const SUCCESS_REGIS_PLAN_MSG = "All courses in the plan are successfully registered." +
                               " Registration code: ";
const SUCCESS_PLAN_MSG = "This course has been successfully added to the plan!";
const SUCCESS_DEL_MSG = "All plans have been successfully deleted.";
const INVALID_CREDENTIAL_MSG = "Student id or password is incorrect, please try again.";
const SUCCESS_LOGIN_MSG = "Login successful.";

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(cookieParser());

/**
 * Gets all courses in the database.
 * The anonymous function responds with JSON of all course data.
 */
app.get('/course/all', async (req, res) => {
  try {
    let db = await getDBConnection();
    let courses = await db.all("SELECT * FROM courses ORDER BY id");
    await db.close();
    res.json(courses);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Gets all course registered by a student with student id passed in query parameter.
 * The anonymous function responds with JSON of the student's all registered courses.
 */
app.get('/course/', async (req, res) => {
  try {
    let studentId = req.query.user;
    if (studentId) {
      let db = await getDBConnection();
      let qry = "SELECT courseCode, courseName, regisID, regisCode FROM registration, courses " +
                "WHERE id = courseID AND studentID = ? ORDER BY id;";
      let courses = await db.all(qry, studentId);
      await db.close();
      res.json(courses);
    } else {
      res.type('text');
      res.status(BAD_REQ_CODE).send(INVALID_USER_MSG);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Gets all departments name in the database.
 * The anonymous function responds with JSON of all the department names.
 */
app.get('/course/departments', async (req, res) => {
  try {
    let db = await getDBConnection();
    let qry = "SELECT DISTINCT courseDepartment FROM courses ORDER BY courseDepartment;";
    let departments = await db.all(qry);
    await db.close();
    res.json(departments);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Gets detailed data for a particular course.
 * The anonymous function responds with detailed JSON of the course.
 */
app.get('/course/:code', async (req, res) => {
  try {
    let db = await getDBConnection();
    let courseCode = req.params.code;
    let course = await db.get("SELECT * FROM courses WHERE courseCode = ?;", courseCode);
    await db.close();
    if (!course) {
      res.type('text');
      res.status(BAD_REQ_CODE).send(INVALID_COURSE_MSG);
    } else {
      res.json(course);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Logins a user.
 * The anonymous function responds with text indicating if login is successful.
 */
app.post('/login', async (req, res) => {
  const maxSignedInt = 0x7fffffff;
  const thousand = 1e3;
  const cookieExprtn = new Date(maxSignedInt * thousand);
  res.type('text');
  try {
    let userID = req.body.id;
    let psw = req.body.psw;
    if (userID && psw) {
      let db = await getDBConnection();
      let user = await db.get("SELECT * FROM users WHERE id = ? AND password = ?;", [userID, psw]);
      await db.close();
      if (!user) {
        res.status(BAD_REQ_CODE).send(INVALID_CREDENTIAL_MSG);
      } else {
        res.cookie("id", userID, {expires: new Date(Date.now() + cookieExprtn)});
        res.cookie("major", user.major, {expires: new Date(Date.now() + cookieExprtn)});
        res.send(SUCCESS_LOGIN_MSG);
      }
    } else {
      res.status(BAD_REQ_CODE).send(MISSING_PARAM_MSG);
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Enrolls a user into the course.
 * The anonymous function responds with text indicating if registration is successful.
 */
app.post('/course/enroll', async (req, res) => {
  res.type('text');
  try {
    let studentId = req.body.studentId;
    let courseCode = req.body.courseCode;
    if (studentId && courseCode) {
      let db = await getDBConnection();
      let qry = "SELECT id FROM courses WHERE courseCode = ?;";
      let courseId = await db.get(qry, courseCode);
      courseId = courseId.id;
      qry = "SELECT regisID FROM registration WHERE studentID = ? AND courseID = ?;";
      let regisId = await db.get(qry, [studentId, courseId]);
      if (!regisId) {
        let cfCode = genConfirmCode(studentId) + courseCode.replace(" ", "");
        await enroll(db, studentId, courseId, cfCode);
        await db.close();
        res.send(SUCCESS_REGIS_MSG + cfCode);
      } else {
        await db.close();
        res.status(BAD_REQ_CODE).send(BAD_REGIS_MSG);
      }
    } else {
      res.status(BAD_REQ_CODE).send(MISSING_PARAM_MSG);
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Searches and filters all the courses.
 * The anonymous function responds with JSON object containing information of the search result.
 */
app.post('/course/search', async (req, res) => {
  try {
    let db = await getDBConnection();
    let searchKey = req.body.key;
    let isFilterOn = req.body.filterOn;
    let departments = req.body.departments;
    let [majorSpecific, departmentSpec] = setSearchQry(isFilterOn, departments);
    if (searchKey) {
      searchKey = "%" + searchKey + "%";
      let qry = "SELECT * FROM courses WHERE (" + majorSpecific + ") AND" + departmentSpec +
                " (courseCode LIKE ? OR courseName LIKE ? OR courseDepartment LIKE ?);";
      let courses = await db.all(qry, [searchKey, searchKey, searchKey]);
      await db.close();
      res.json(courses);
    } else {
      res.type('text');
      res.status(BAD_REQ_CODE).send(MISSING_PARAM_MSG);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Gets all planned courses in the database.
 * The anonymous function responds with JSON object containing information of all the all planned
 * courses in the database.
 */
app.get('/plan/all', async (req, res) => {
  try {
    let db = await getDBConnection();
    let plans = await db.all("SELECT * FROM plan ORDER BY planID");
    await db.close();
    res.json(plans);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Deletes all planned courses in the database.
 * The anonymous function responds with plain text indicating if the deletion is successful.
 */
app.get('/plan/clear', async (req, res) => {
  res.type('text');
  try {
    let db = await getDBConnection();
    await db.exec("DELETE FROM plan");
    await db.close();
    res.send(SUCCESS_DEL_MSG);
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Adds a course to the planned course in database.
 * The anonymous function responds with plain text indicating if the additon of the new course into
 * plan is successful.
 */
app.post('/plan/add', async (req, res) => {
  res.type('text');
  try {
    let db = await getDBConnection();
    let studentId = req.body.studentID;
    let courseCode = req.body.courseCode;
    if (studentId && courseCode) {
      let qry = "INSERT INTO plan(studentID, courseCode) VALUES (?, ?);";
      await db.run(qry, [studentId, courseCode]);
      await db.close();
      res.send(SUCCESS_PLAN_MSG);
    } else {
      res.status(BAD_REQ_CODE).send(MISSING_PARAM_MSG);
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Registers all the courses for the user in the plain at one time.
 * The anonymous function responds with plain text indicating if the registration of all the courses
 * in the plan is successful.
 */
app.post('/plan/enroll', async (req, res) => {
  res.type('text');
  try {
    let studentId = req.body.studentID;
    let plans = req.body.plans;
    if (studentId && plans) {
      let db = await getDBConnection();
      let cfCode = "";
      plans = plans.split(",");
      let isValidPlan = await loopPlans(db, plans, studentId, false);
      if (isValidPlan) {
        await loopPlans(db, plans, studentId, true);
        cfCode = genConfirmCode(studentId) + plans[0].replace(" ", "");
        await db.close();
        res.send(SUCCESS_REGIS_PLAN_MSG + cfCode);
      } else {
        await db.close();
        res.status(BAD_REQ_CODE).send(BAD_REGIS_PLAN_MSG);
      }
    } else {
      res.status(BAD_REQ_CODE).send(MISSING_PARAM_MSG);
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERR_MSG);
  }
});

/**
 * Helper functions to loop through the plans containing strings of course code and see if it's a
 * valid plan. If it is, loop again to enroll the courses.
 * @param {object} db - the database handler.
 * @param {object} plans - array of strings of course code.
 * @param {string} studentId - string of student ID.
 * @param {boolean} isEnroll - boolean value indicating whether this loop is for enroll.
 * @returns {boolean} - false if plan is invalid; true otherwise.
 */
async function loopPlans(db, plans, studentId, isEnroll) {
  for (let i = 0; i < plans.length; i++) {
    let qry = "SELECT id FROM courses WHERE courseCode = ?;";
    let courseId = await db.get(qry, plans[i]);
    courseId = courseId.id;
    if (!isEnroll) {
      qry = "SELECT regisID FROM registration WHERE studentID = ? AND courseID = ?;";
      let regisId = await db.get(qry, [studentId, courseId]);
      if (regisId) {
        return false;
      }
    } else {
      let cfCode = genConfirmCode(studentId) + plans[0].replace(" ", "");
      await enroll(db, studentId, courseId, cfCode);
    }
  }
  return true;
}

/**
 * Enrolls a student into a course with given ids, write the change in the database given.
 * @param {object} db - the database to be updated.
 * @param {number} studentId - the student ID.
 * @param {string} courseId - the course ID.
 * @param {string} cfCode - the confirmation code.
 */
async function enroll(db, studentId, courseId, cfCode) {
  let qry = "INSERT INTO registration(regisCode, studentID, courseID) VALUES (?, ?, ?);";
  await db.run(qry, [cfCode, studentId, courseId]);
  qry = "UPDATE courses SET availNum = availNum - 1 WHERE id = ?;";
  await db.run(qry, courseId);
}

/**
 * Sets the search query for the search endpoint.
 * @param {string} isFilterOn - the string indicating the filter is on or not.
 * @param {string} departments - the string representing the department of the student.
 * @returns {object} - the array of query pieces used for search database query.
 */
function setSearchQry(isFilterOn, departments) {
  let majorSpecific;
  let departmentSpec;
  if (isFilterOn === "true") {
    majorSpecific = "majorSpecific = 'None'";
  } else {
    majorSpecific = "majorSpecific != ''";
  }
  if (departments === "Search by major") {
    departmentSpec = "";
  } else {
    departmentSpec = " (courseDepartment = '" + departments + "') AND";
  }
  return [majorSpecific, departmentSpec];
}

/**
 * Generates an unique confirmation code for a registration with the student id given.
 * @param {number} studentId - the student id given to generate
 * @returns {string} - the confimation code generated.
 */
function genConfirmCode(studentId) {
  let intToText = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let textId = "";
  studentId = studentId.toString();
  for (let i = 0; i < studentId.length; i++) {
    textId += intToText[parseInt(studentId[i])];
  }
  return textId + Date.now();
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'registration.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);