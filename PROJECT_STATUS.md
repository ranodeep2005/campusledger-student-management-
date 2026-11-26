# Project Status – CampusLedger
# Author: Ranodeep Malik | Last Updated: 2026-11-26

## Overall Status: ✅ IMPLEMENTATION COMPLETE – PENDING COMPILE VERIFICATION

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
- **Status:** ✅ Implemented
- **Files:** StudentApiTest.java (10 tests), API_TESTING.md (all cURL commands)
- **Test DB:** H2 in-memory (no MySQL needed for tests)

### Experiment 9 – Spring Security
- **Status:** ✅ Implemented
- **Files:** SecurityConfig.java
- **Credentials:** admin/campus123, student/learn456

---

## Pending Actions (requires you to complete)

1. **MySQL database setup** – Create `studentdb` database and set your password
2. **Run `mvn test`** – Compile and test verification
3. **Run the app** – Test live endpoints with cURL
4. **GitHub push** – Create repo and push with meaningful commits

---

## Next Steps

1. Open MySQL Workbench → Run: `CREATE DATABASE studentdb;`
2. Set DB_PASSWORD environment variable with your MySQL root password
3. Run: `mvn test` (from CampusLedger directory using IntelliJ terminal)
4. Run: `mvn spring-boot:run`
5. Test with cURL commands from API_TESTING.md
6. Push to GitHub: campusledger-student-management
