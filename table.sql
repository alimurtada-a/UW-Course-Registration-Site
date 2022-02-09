CREATE TABLE "courses" (
	"id"	INTEGER NOT NULL,
	"courseCode"	TEXT NOT NULL,
	"courseName"	INTEGER NOT NULL,
	"courseDepartment"	TEXT NOT NULL,
	"majorSpecific"	TEXT NOT NULL,
	"instructor"	TEXT NOT NULL,
	"availNum"	INTEGER NOT NULL,
	"capacity"	INTEGER NOT NULL,
	"credit"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE "plan" (
	"planID"	INTEGER NOT NULL,
	"studentID"	INTEGER NOT NULL,
	"courseCode"	TEXT NOT NULL,
	PRIMARY KEY("planID" AUTOINCREMENT)
);
CREATE TABLE "registration" (
	"regisID"	INTEGER NOT NULL,
	"regisCode"	TEXT NOT NULL,
	"studentID"	INTEGER NOT NULL,
	"courseID"	INTEGER NOT NULL,
	FOREIGN KEY("courseID") REFERENCES "courses"("id"),
	FOREIGN KEY("studentID") REFERENCES "users"("id"),
	PRIMARY KEY("regisID" AUTOINCREMENT)
);
CREATE TABLE "users" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"major"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("id")
);