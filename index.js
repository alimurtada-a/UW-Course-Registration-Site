/**
 * Name: Tianmeng Wang and Ali
 * Date: Dec 2nd, 2021
 * Section: CSE 154 AF, TA: Austin Jenchi and Tara Wueger
 *
 * This is the javascript used in the index.html. This defines the general behaviour as the user
 * interacts with the registration page.
 */
"use strict";

(function() {

  /**
   * Add a function that will be called when the window is loaded.
   */
  window.addEventListener("load", init);

  /**
   * Initializes the login id in the input. Initializes the search by major options on the search
   * page.
   * Adds interactivities of:
   * (1) login the user when login button is clicked on.
   * (2) search for the key in database when search button is clicked on.
   * (3) switch the view of all courses, course search, my plan, and my register courses view when
   *     the button on navigation bar is clicked.
   * (4) swith between the grid and list view of all courses page when the corresponding button is
   *     clicked on.
   * (5) confirm to register when button on confirm tab is clicked on.
   * (6) send courses to plan when the button of add to plan is clicked on.
   * (7) send courses to registration when the button of add to registration is clicked on.
   * (8) sign out the user when sign out button is clicked on.
   */
  function init() {
    initStudentId();
    initSearchOptions();
    id("login-form").addEventListener("submit", function(elm) {
      elm.preventDefault();
      login();
    });
    qs("#search-page form").addEventListener("submit", function(elm) {
      elm.preventDefault();
      search();
    });
    qsa("#navbar p")[1].addEventListener("click", toAllCourses);
    qsa("#navbar p")[2].addEventListener("click", toSearch);
    qsa("#navbar p")[3].addEventListener("click", toMyPlan);
    qsa("#navbar p")[4].addEventListener("click", toMyReg);
    qsa("#navbar p")[5].addEventListener("click", signOut);
    qsa("#all-courses input")[0].addEventListener("click", showGrid);
    qsa("#all-courses input")[1].addEventListener("click", showList);
    qsa("#course-info button")[0].addEventListener("click", confirmRegister);
    qsa("#course-info button")[1].addEventListener("click", addToPlan);
    qsa("#confirm-tab button")[0].addEventListener("click", registerCourse);
    qsa("#confirm-tab button")[1].addEventListener("click", function() {
      hide(id("confirm-tab"));
    });
    qsa("#plan button")[0].addEventListener("click", registerAll);
    qsa("#plan button")[1].addEventListener("click", function() {
      deleteAll(true);
    });
  }

  /**
   * Initializes the page's student id input field.
   */
  function initStudentId() {
    id("studentID").value = getCookieValue("id");
  }

  /**
   * Initializes the options for search by department on the search page.
   */
  function initSearchOptions() {
    fetch("/course/departments")
      .then(statusCheck)
      .then(res => res.json())
      .then(function(res) {
        for (let i = 0; i < res.length; i++) {
          let newOption = gen("option");
          qs("#search-page form select").appendChild(newOption);
          newOption.textContent = res[i].courseDepartment;
        }
      })
      .catch(handleErr);
  }

  /**
   * Login a user when user clicked the login button.
   */
  function login() {
    let studentId = id("studentID").value;
    let psw = id("password").value;
    let params = new FormData();
    params.append("id", parseInt(studentId));
    params.append("psw", psw);
    fetch("/login", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(function() {
        id("left-side").textContent = id("left-side").textContent.split(":")[0] + ": " + studentId;
        toSearch();
      })
      .catch(handleErr);
  }

  /**
   * Signs out the user when the sign out button is clicked on.
   */
  function signOut() {
    showOnly(id("login-page"));
    hide(qs("header"));
    id("password").value = "";
  }

  /**
   * Shows the grid view of all courses list.
   */
  function showGrid() {
    show(qsa("#all-courses div")[1]);
    hide(qsa("#all-courses div")[2]);
  }

  /**
   * Shows the grid view of all courses list.
   */
  function showList() {
    show(qsa("#all-courses div")[2]);
    hide(qsa("#all-courses div")[1]);
  }

  /**
   * Shows all course page.
   */
  function toAllCourses() {
    activeOnly(qsa("#navbar p")[1]);
    showOnly(id("all-courses"));
    fetch("/course/all")
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        appendCourses(res, id("grid"), true);
        appendCourses(res, id("list"), false);
      })
      .catch(handleErr);
  }

  /**
   * Shows the search page only.
   */
  function toSearch() {
    qs("#search-page ul").innerHTML = "";
    activeOnly(qsa("#navbar p")[2]);
    showOnly(id("search-page"));
    show(qs("header"));
  }

  /**
   * Shows all the planned courses for the user.
   */
  function toMyPlan() {
    activeOnly(qsa("#navbar p")[3]);
    showOnly(id("plan"));
    fetch("/plan/all")
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        for (let i = 0; i < res.length; i++) {
          let courseCode = res[i].courseCode;
          let newPlanId = courseCode.replace(" ", "-");
          if (!id(newPlanId)) {
            appendNewPlan(newPlanId, courseCode);
          }
        }
        if (qs("#plan ul li")) {
          hide(qs("#plan > p"));
          show(qs("#plan > div"));
        } else {
          show(qs("#plan > p"));
          hide(qs("#plan > div"));
        }
      })
      .catch(handleErr);
  }

  /**
   * Shows all the registered courses for the user.
   */
  function toMyReg() {
    let studentId = getCookieValue("id");
    activeOnly(qsa("#navbar p")[4]);
    showOnly(id("my-courses"));
    fetch("/course/?user=" + studentId)
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        if (res.length !== 0) {
          qs("#my-courses p").classList.add("hidden");
          appendCourses(res, qs("#my-courses ul"), false);
        } else {
          qs("#my-courses ul").innerHTML = "";
          qs("#my-courses p").classList.remove("hidden");
        }
      })
      .catch(handleErr);
  }

  /**
   * Helper function to activate only the button given on the navigation bar.
   * @param {object} btn - the button to be activated.
   */
  function activeOnly(btn) {
    qsa("#navbar p")[1].classList.remove("active");
    qsa("#navbar p")[2].classList.remove("active");
    qsa("#navbar p")[3].classList.remove("active");
    qsa("#navbar p")[4].classList.remove("active");
    btn.classList.add("active");
  }

  /**
   * Searches all the courses with the search key and the filter option given when the search button
   * is clicked on.
   */
  function search() {
    let key = qs("#search-page form input").value;
    let departments = qs("#search-page form select").value;
    let isFilterOn = qsa("#search-page form input")[1].checked;
    let params = new FormData();
    params.append("key", key);
    params.append("departments", departments);
    params.append("filterOn", isFilterOn);
    fetch("/course/search", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(displaySearch)
      .catch(handleErr);
  }

  /**
   * Displays the course search page.
   * @param {object} res - the JSON object response from fetch chain.
   */
  function displaySearch(res) {
    hide(id("login-page"));
    show(id("search-page"));
    appendCourses(res, qs("#search-page ul"), false);
  }

  /**
   * Helper function to add courses to the page.
   * @param {object} res - the JSON object of the courses from the fetch chain.
   * @param {object} node - DOM object to append the courses to.
   * @param {boolean} isGrid - boolean value indicating if the courses should be appended as grid.
   */
  function appendCourses(res, node, isGrid) {
    node.innerHTML = "";
    for (let i = 0; i < res.length; i++) {
      let newCourse = gen("li");
      let courseName = gen("button");
      if (isGrid) {
        courseName.textContent = res[i].courseCode;
      } else {
        courseName.textContent = res[i].courseCode + ": " + res[i].courseName;
      }
      courseName.addEventListener("click", displayCourse);
      newCourse.appendChild(courseName);
      if (res[i].regisCode) {
        let regisId = gen("p");
        regisId.textContent = "Registration code: " + res[i].regisCode;
        newCourse.appendChild(regisId);
      }
      node.appendChild(newCourse);
    }
  }

  /**
   * Displays the detailed course page when the course name is clicked on.
   */
  function displayCourse() {
    showOnly(id("course-info"));
    let courseCode = this.textContent.split(":")[0];
    fetch("/course/" + courseCode)
      .then(statusCheck)
      .then(res => res.json())
      .then(function(res) {
        qs("#course-info article").innerHTML = "";
        populateCourse(res);
        hide(id("confirm-tab"));
      })
      .catch(handleErr);
  }

  /**
   * Populates the courses info page.
   * @param {object} res - the JSON response from the fetch chain.
   */
  function populateCourse(res) {
    let courseName = qs("#course-info h1");
    let [creditsValue, departmentValue, instructorValue, majorSpecificValue, availibilityValue,
         chartValue] = genCourse();
    courseName.textContent = res.courseCode + ": " + res.courseName;
    creditsValue.textContent = res.credit;
    departmentValue.textContent = res.courseDepartment;
    instructorValue.textContent = res.instructor;
    if (res.majorSpecific === "None") {
      majorSpecificValue.textContent = "YES";
    } else {
      majorSpecificValue.textContent = "NO";
    }
    majorSpecificValue.id = "open-major";
    availibilityValue.textContent = res.availNum + " avail of " + res.capacity;
    availibilityValue.id = "availibility";
    chartValue.appendChild(creditsValue);
    chartValue.appendChild(departmentValue);
    chartValue.appendChild(instructorValue);
    chartValue.appendChild(majorSpecificValue);
    chartValue.appendChild(availibilityValue);
  }

  /**
   * Helper function for populateCourse(); Generates html nodes and adds the dependencies of DOM
   * structure as needed.
   * @returns {object} - array containing the nodes' reference.
   */
  function genCourse() {
    let courseInfo = gen("table");
    let chartTitle = gen("tr");
    let chartValue = gen("tr");
    let credits = gen("th");
    let creditsValue = gen("td");
    let department = gen("th");
    let departmentValue = gen("td");
    let majorSpecific = gen("th");
    let majorSpecificValue = gen("td");
    let availibility = gen("th");
    let availibilityValue = gen("td");
    let instructor = gen("th");
    let instructorValue = gen("td");
    credits.textContent = "Credits";
    department.textContent = "Department";
    majorSpecific.textContent = "Open to all major";
    availibility.textContent = "Availibility";
    instructor.textContent = "Instructor";
    chartTitle.appendChild(credits);
    chartTitle.appendChild(department);
    chartTitle.appendChild(instructor);
    chartTitle.appendChild(majorSpecific);
    chartTitle.appendChild(availibility);
    courseInfo.appendChild(chartTitle);
    courseInfo.appendChild(chartValue);
    qs("#course-info article").appendChild(courseInfo);
    return [creditsValue, departmentValue, instructorValue, majorSpecificValue, availibilityValue,
            chartValue];
  }

  /**
   * Confirms the user of whether registering the course.
   */
  async function confirmRegister() {
    hide(id("result"));
    let courseCode = qs("#course-info h1").textContent.split(":")[0];
    let studentMajor = getCookieValue("major");
    let open = await isOpen(courseCode, studentMajor);
    if (open) {
      show(id("confirm-tab"));
      qs("#confirm-tab p").textContent = "Are you sure you want to " +
                                         "register for " + courseCode + "?";
    } else {
      genResult("Course is not open for register.", true);
    }
  }

  /**
   * Appends a new plan tag to the page with the id and the course code to be added given.
   * @param {string} newPlanId - the node id for the new plan p tag.
   * @param {string} courseCode - course code to be added to the plan.
   */
  function appendNewPlan(newPlanId, courseCode) {
    let newPlan = gen("li");
    newPlan.textContent = courseCode;
    newPlan.id = newPlanId;
    newPlan.addEventListener("click", displayCourse);
    qs("#plan ul").appendChild(newPlan);
  }

  /**
   * Adds a course to the plan database.
   */
  async function addToPlan() {
    let courseCode = qs("#course-info h1").textContent.split(":")[0];
    let studentMajor = getCookieValue("major");
    let open = await isOpen(courseCode, studentMajor);
    if (open) {
      let newPlanId = courseCode.replace(" ", "-");
      if (!id(newPlanId)) {
        let params = new FormData();
        let studentId = getCookieValue("id");
        appendNewPlan(newPlanId, courseCode);
        params.append("studentID", studentId);
        params.append("courseCode", courseCode);
        fetch("/plan/add", {method: "POST", body: params})
          .then(statusCheck)
          .then(res => res.text())
          .then(function(res) {
            genResult(res, false);
          })
          .catch(handleErr);
      } else {
        genResult("This course is already in the plan!", true);
      }
    } else {
      genResult("Course is not open for register.", true);
    }
  }

  /**
   * Registers the user for the course when a register button under course-info page is clicked.
   */
  function registerCourse() {
    let studentId = getCookieValue("id");
    let courseCode = qs("#course-info h1").textContent.split(":")[0].trim();
    let params = new FormData();
    params.append("studentId", studentId);
    params.append("courseCode", courseCode);
    hide(id("confirm-tab"));
    fetch("/course/enroll", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(res => {
        genResult(res, false);
      })
      .catch(handleErr);
  }

  /**
   * Registers all the planned courses on the plan page.
   */
  function registerAll() {
    let studentId = getCookieValue("id");
    let plans = [];
    for (let i = 0; i < qsa("#plan ul li").length; i++) {
      plans.push(qsa("#plan ul li")[i].textContent);
    }
    let params = new FormData();
    params.append("studentID", studentId);
    params.append("plans", plans);
    fetch("/plan/enroll", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(res => {
        deleteAll(false);
        genResult(res, false);
      })
      .catch(handleErr);
  }

  /**
   * Deletes all the planned courses on the plan page.
   * @param {boolean} showResult - boolean value indicating whether result of deletion is shown.
   */
  function deleteAll(showResult) {
    qs("#plan ul").innerHTML = "";
    show(qs("#plan > p"));
    hide(qs("#plan > div"));
    fetch("/plan/clear")
      .then(statusCheck)
      .then(res => res.text())
      .then(res => {
        if (showResult) {
          genResult(res, false);
        }
      })
      .catch(handleErr);
  }

  /**
   * Gets a cookie value from its key.
   * @param {string} key - the cookie value key.
   * @returns {string} - the string indicating whether the cookie value is found.
   */
  function getCookieValue(key) {
    let cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].split("=")[0].trim() === key) {
        return cookies[i].split("=")[1];
      }
    }
    return "";
  }

  /**
   * Check if course is open for register for the user.
   * @param {string} courseCode - the course code to see if is open for register for the user.
   * @param {string} studentMajor - the major of the student.
   * @returns {boolean} - boolean value indicating whether the course is open.
   */
  async function isOpen(courseCode, studentMajor) {
    let open = false;
    try {
      let res = await fetch("/course/" + courseCode);
      res = await res.json();
      let availNum = res.availNum;
      if (availNum !== 0) {
        if (id("open-major").textContent === "YES") {
          open = true;
        } else if (studentMajor === res.courseDepartment) {
          open = true;
        }
      }
    } catch (err) {
      handleErr(err);
    }
    return open;
  }

  /**
   * Helper function to show only the DOM object given and hides all the other parts on the page.
   * @param {object} node - the DOM object to be shown.
   */
  function showOnly(node) {
    hide(id("login-page"));
    hide(id("all-courses"));
    hide(id("search-page"));
    hide(id("plan"));
    hide(id("my-courses"));
    hide(id("course-info"));
    hide(id("result"));
    show(node);
  }

  /**
   * Handles all the fetch error.
   * @param {string} err - the error message.
   */
  function handleErr(err) {
    genResult(err, true);
  }

  /**
   * Genrates the result message onto the page.
   * @param {string} msg - the result message to be displayed on the page.
   * @param {boolean} isError - the boolean value indicating whether the message is an error.
   */
  function genResult(msg, isError) {
    id("result").innerHTML = "";
    show(id("result"));
    let result = gen("p");
    if (!isError) {
      result.classList.add("success-msg");
    } else {
      result.classList.add("failure-msg");
    }
    result.textContent = msg;
    id("result").appendChild(result);
  }

  /**
   * Shows the given element in the page.
   * @param {object} elm - DOM object to show.
   */
  function show(elm) {
    elm.classList.remove("hidden");
  }

  /**
   * Hides the given element from the page.
   * @param {object} elm - DOM object to hide.
   */
  function hide(elm) {
    elm.classList.add("hidden");
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID.
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text.
   * @param {object} res - response to check for success/error.
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

})();