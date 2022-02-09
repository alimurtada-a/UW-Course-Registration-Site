# Course registration API Documentation
The Course registration API provides information about the courses stored in database and interactivity with the database.

## Endpoint 1 - Get all courses
**Request Format:**
/course/all
**Request Type:**
get
**Returned Data Format**:
JSON
**Description:**
Gets all courses in the database. The anonymous function responds with JSON of all course data.
**Example Request:**
/course/all
**Example Response:**

```

```

**Error Handling:**
possible 500: Server is down for now, don't try again.


## Endpoint 2 - title here
**Request Format:**
/course/
**Request Type:**
get
**Returned Data Format**:
JSON
**Description:**

**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 500: Server is down for now, don't try again.
possible 400: User does not exist.


## Endpoint 3 - title here
**Request Format:**
/course/departments
**Request Type:**
get
**Returned Data Format**:
JSON
**Description:**

**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 500: Server is down for now, don't try again.



## Endpoint 4 - Course data
**Request Format:**
/course/:code
**Request Type:**
get
**Returned Data Format**:
JSON
**Description:**
Gets detailed data for a particular course.
**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 400: Course does not exist.
possible 500: Server is down for now, don't try again.


## Endpoint 5 - Log in
**Request Format:**
/login
**Request Type:**
post
**Returned Data Format**:
JSON
**Description:**
Logs in user
**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 400: Student id or password is incorrect, please try again.possible 400: One or more parameter is missing.
possible 500: Server is down for now, don't try again.


## Endpoint 6 - course enrollment
**Request Format:**
/course/enroll
**Request Type:**
post
**Returned Data Format**:
text
**Description:**
enrolls user in a course
**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 400: Course is already registered.
possible 400: One or more parameter is missing.
possible 500: Server is down for now, don't try again.


## Endpoint 7 - course search
**Request Format:**
/course/search
**Request Type:**
post
**Returned Data Format**:
JSON
**Description:**
Searches and filters all the courses.
**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 400: One or more parameter is missing.
possible 500: Server is down for now, don't try again.



## Endpoint 8 - title here
**Request Format:**
/plan/all
**Request Type:**
get
**Returned Data Format**:
JSON
**Description:**

**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 500: Server is down for now, don't try again.



## Endpoint 9 - clear plan
**Request Format:**
/plan/clear
**Request Type:**
get
**Returned Data Format**:

**Description:**
removes my classes from plan
**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 500: Server is down for now, don't try again.



## Endpoint 10 - add class to plan
**Request Format:**
/plan/add
**Request Type:**
post
**Returned Data Format**:
text
**Description:**

**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 400: One or more parameter is missing.
possible 500: Server is down for now, don't try again.


## Endpoint 11 - enroll from plan
**Request Format:**
/plan/enroll
**Request Type:**
post
**Returned Data Format**:
text
**Description:**
registers classes from my plan
**Example Request:**

**Example Response:**

```json

```

**Error Handling:**
possible 400: One or more courses in the plan is already registered.
possible 400: One or more parameter is missing.
possible 500: Server is down for now, don't try again.

