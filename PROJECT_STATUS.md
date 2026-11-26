# Project Status – CampusLedger
# Author: Ranodeep Malik | Last Updated: 2026-11-26

## Overall Status: ✅ TESTS & PACKAGE VERIFIED (13/13 TESTS PASSED)

**Last Test & Package Run:** 2026-11-26 | `mvn -o clean package` → Tests run: 13, Failures: 0, Errors: 0, Skipped: 0 | `BUILD SUCCESS` (`target/campusledger-1.0.0.jar`)

---

## Environment

| Tool | Status | Version |
|------|--------|---------|
| Java (JBR) | ✅ Installed | OpenJDK 25.0.3 (JetBrains) |
| Maven | ✅ Available | 3.9.16 (via .m2 wrapper) |
| MySQL Server | ✅ Installed | MySQL 8.0 |
| IntelliJ IDEA | ✅ Installed | 2026.2.1 |
| Git | ✅ Installed | Available in PATH |

---

## Implementation Status

### Experiment 3 – In-Memory REST CRUD
- **Status:** ✅ Implemented
- **Files:** Student.java, StudentController.java, StudentService.java
- **Endpoints:** GET/POST/PUT/DELETE /students

### Experiment 4 – MySQL & JPA
- **Status:** ✅ Implemented (pending live MySQL connection test)
- **Files:** application.properties, StudentRepository.java (JpaRepository)
- **Action Required:** Create `studentdb` database; set DB_PASSWORD env variable

### Experiment 5 – Derived Queries & Pagination
- **Status:** ✅ Implemented
- **Files:** StudentRepository.java, StudentService.java, StudentController.java
- **Endpoints:** /students/search/*, /students/paged

### Experiment 6 – One-to-Many Relationship
- **Status:** ✅ Implemented
- **Files:** Course.java, CourseRepository.java, CourseService.java, CourseController.java

### Experiment 7 – Validation & Exception Handling
- **Status:** ✅ Implemented
- **Files:** GlobalExceptionHandler.java, Student.java (@NotBlank/@Email), Course.java

### Experiment 8 – API Testing
- **Status:** ✅ Implemented & Verified
- **Files:** StudentApiTest.java (10 tests), FrontendAndCourseApiTest.java (3 tests), API_TESTING.md (all cURL commands)
- **Test DB:** H2 in-memory (no MySQL needed for tests)

### Experiment 9 – Spring Security & Frontend Static Resources
- **Status:** ✅ Implemented & Verified
- **Files:** SecurityConfig.java, `src/main/resources/static/` (`login.html`, `index.html`, `css/style.css`, `js/*.js`), `FRONTEND_GUIDE.md`
- **Credentials:** admin/campus123, student/learn456
- **Static Access:** Permits `/`, `/index.html`, `/login.html`, `/favicon.ico`, `/error`, `/css/**`, `/js/**`, `/images/**`, and `PathRequest.toStaticResources().atCommonLocations()`

---

## Pending Actions (requires you to complete)

1. **MySQL schema safety check & `student_id` `BIGINT` verification** – MySQL `MySQL80` is running on port 3306, but `DB_PASSWORD` is not set in the environment or `application-local.properties`, so automated access to `studentdb` was denied (`ERROR 1045`). Verify `studentdb` and run `ALTER TABLE course MODIFY COLUMN student_id BIGINT NOT NULL;` only if needed after checking existing data/FKs.
2. **Run the app against live MySQL** – Set `DB_PASSWORD` (or create `application-local.properties`) and run `mvn spring-boot:run`
3. **GitHub push** – Create repo and push with meaningful commits when ready

---

## Next Steps

1. Open MySQL Workbench → Run: `CREATE DATABASE studentdb;`
2. Set DB_PASSWORD environment variable with your MySQL root password
3. Run: `mvn test` (from CampusLedger directory using IntelliJ terminal)
4. Run: `mvn spring-boot:run`
5. Test with cURL commands from API_TESTING.md
6. Push to GitHub: campusledger-student-management
