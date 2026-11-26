# API Testing – CampusLedger
# All cURL commands for Windows CMD (Experiment 8)
# Author: Ranodeep Malik
#
# Base URL: http://localhost:8081
# Auth credentials: admin:campus123
#
# Run: Start the app first with `mvn spring-boot:run`
# ======================================================

# ── Experiment 9: Security Tests ──────────────────────────────────────────────

# Public endpoint (no auth needed) – should return 200
curl http://localhost:8081/hello

# Protected endpoint without credentials – should return 401
curl http://localhost:8081/students

# Protected endpoint with WRONG credentials – should return 401
curl -u admin:wrongpassword http://localhost:8081/students

# Protected endpoint with CORRECT credentials – should return 200
curl -u admin:campus123 http://localhost:8081/students

# ── Experiment 3 & 4: Student CRUD ───────────────────────────────────────────

# POST – Create a student
curl -u admin:campus123 -X POST http://localhost:8081/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Priya Sharma\",\"email\":\"priya.sharma@campusledger.in\",\"branch\":\"CSE\",\"semester\":4}"

# POST – Create another student
curl -u admin:campus123 -X POST http://localhost:8081/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Arjun Verma\",\"email\":\"arjun.verma@campusledger.in\",\"branch\":\"ECE\",\"semester\":3}"

# POST – Create a third student
curl -u admin:campus123 -X POST http://localhost:8081/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Tanvi Patel\",\"email\":\"tanvi.patel@campusledger.in\",\"branch\":\"CSE\",\"semester\":6}"

# GET – All students
curl -u admin:campus123 http://localhost:8081/students

# GET – Student by ID (replace 1 with actual ID)
curl -u admin:campus123 http://localhost:8081/students/1

# PUT – Update student (replace 1 with actual ID)
curl -u admin:campus123 -X PUT http://localhost:8081/students/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Priya Sharma\",\"email\":\"priya.updated@campusledger.in\",\"branch\":\"CSE\",\"semester\":5}"

# DELETE – Remove student (replace 1 with actual ID)
curl -u admin:campus123 -X DELETE http://localhost:8081/students/1

# GET – After delete (should return 404)
curl -u admin:campus123 http://localhost:8081/students/1

# ── Experiment 7: Validation Failure Tests ────────────────────────────────────

# POST – Missing name (should return 400 Bad Request)
curl -u admin:campus123 -X POST http://localhost:8081/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"\",\"email\":\"test@test.in\",\"branch\":\"CSE\",\"semester\":2}"

# POST – Invalid email format (should return 400)
curl -u admin:campus123 -X POST http://localhost:8081/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Student\",\"email\":\"not-an-email\",\"branch\":\"ECE\",\"semester\":3}"

# POST – Missing branch (should return 400)
curl -u admin:campus123 -X POST http://localhost:8081/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Student\",\"email\":\"test2@test.in\",\"branch\":\"\",\"semester\":3}"

# ── Experiment 5: Search, Pagination, Sorting ─────────────────────────────────

# GET – Search by exact name
curl -u admin:campus123 "http://localhost:8081/students/search/name?name=Priya Sharma"

# GET – Search by name containing keyword
curl -u admin:campus123 "http://localhost:8081/students/search/name-contains?keyword=an"

# GET – Search by email
curl -u admin:campus123 "http://localhost:8081/students/search/email?email=arjun.verma@campusledger.in"

# GET – Search by branch
curl -u admin:campus123 "http://localhost:8081/students/search/branch?branch=CSE"

# GET – Paginated (page 0, 5 per page, sorted by name ascending)
curl -u admin:campus123 "http://localhost:8081/students/paged?page=0&size=5&sortBy=name&direction=asc"

# GET – Paginated sorted by semester descending
curl -u admin:campus123 "http://localhost:8081/students/paged?page=0&size=5&sortBy=semester&direction=desc"

# GET – Paginated search
curl -u admin:campus123 "http://localhost:8081/students/search/paged?keyword=a&page=0&size=3"

# ── Experiment 6: Course Endpoints ───────────────────────────────────────────

# POST – Add course to student 2 (replace 2 with actual student ID)
curl -u admin:campus123 -X POST http://localhost:8081/courses/student/2 ^
  -H "Content-Type: application/json" ^
  -d "{\"courseName\":\"Data Structures\",\"courseCode\":\"CS301\",\"credits\":4}"

# POST – Add another course to same student
curl -u admin:campus123 -X POST http://localhost:8081/courses/student/2 ^
  -H "Content-Type: application/json" ^
  -d "{\"courseName\":\"Database Management\",\"courseCode\":\"CS402\",\"credits\":3}"

# GET – All courses
curl -u admin:campus123 http://localhost:8081/courses

# GET – All courses for student 2
curl -u admin:campus123 http://localhost:8081/courses/student/2

# GET – Course by ID
curl -u admin:campus123 http://localhost:8081/courses/1

# PUT – Update course 1
curl -u admin:campus123 -X PUT http://localhost:8081/courses/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"courseName\":\"Advanced Data Structures\",\"courseCode\":\"CS301\",\"credits\":5}"

# DELETE – Remove course 1
curl -u admin:campus123 -X DELETE http://localhost:8081/courses/1

# ── Verification: Check MySQL directly ───────────────────────────────────────
# Open MySQL Workbench or run:
#   mysql -u root -p studentdb
#   SELECT * FROM student;
#   SELECT * FROM course;
#   SELECT s.name, c.course_name FROM student s JOIN course c ON s.id = c.student_id;
