# CampusLedger – Student Management System

> **Author:** Ranodeep Malik  
> **Course:** Enterprise Java  
> **Institution:** B.Tech (Computer Science)  
> **Build Tool:** Maven | **Framework:** Spring Boot 3.3.5 | **Database:** MySQL 8.0  
> **Server Port:** 8081

---

## 1. Project Description

CampusLedger is a RESTful Student Management System built as an Enterprise Java lab project. It manages student records and their enrolled courses using a layered Spring Boot architecture backed by a MySQL database.

The project demonstrates core Enterprise Java concepts: REST APIs, Spring Data JPA, database relationships, bean validation, exception handling, automated API testing, and Spring Security.

---

## 2. Problem Statement

Educational institutions handle large volumes of student data — enrollments, course registrations, academic details — which must be persisted reliably, retrieved efficiently, and exposed through secure APIs. CampusLedger solves this with a backend REST API that any frontend or mobile app can consume.

---

## 3. Objectives

- Implement a full-stack Spring Boot REST API for student management
- Use MySQL as the persistent data store via Spring Data JPA
- Demonstrate derived query methods, pagination, and sorting
- Model a real-world One-to-Many relationship (Student ↔ Courses)
- Apply Bean Validation and centralised exception handling
- Write automated tests using JUnit 5 and MockMvc
- Secure endpoints using Spring Security HTTP Basic Authentication

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.3.5 |
| Build Tool | Maven 3.9.x |
| Database | MySQL 8.0 |
| ORM | Spring Data JPA / Hibernate |
| Validation | Jakarta Bean Validation |
| Security | Spring Security 6 |
| Testing | JUnit 5, MockMvc, H2 (test DB) |
| IDE | IntelliJ IDEA 2026 |

---

## 5. Project Architecture

```
CampusLedger
├── Controller  → Handles HTTP requests, returns ResponseEntity
├── Service     → Business logic, calls Repository
├── Repository  → Spring Data JPA interface, talks to MySQL
├── Model       → JPA entities (Student, Course)
├── Exception   → Custom exceptions + GlobalExceptionHandler
└── Config      → Spring Security configuration
```

**Request Flow:**
```
HTTP Request → Controller → Service → Repository → MySQL Database
                                              ↓
HTTP Response ←  Controller ← Service ← Repository
```

---

## 6. Folder Structure

```
CampusLedger/
├── pom.xml
├── .gitignore
├── application-local.properties.example
├── README.md
├── API_TESTING.md
├── PROJECT_STATUS.md
├── EXPERIMENT_CHECKLIST.md
├── VIVA_PREPARATION.md
└── src/
    ├── main/
    │   ├── java/in/ranodeep/campusledger/
    │   │   ├── CampusLedgerApplication.java
    │   │   ├── model/
    │   │   │   ├── Student.java
    │   │   │   └── Course.java
    │   │   ├── controller/
    │   │   │   ├── StudentController.java
    │   │   │   ├── CourseController.java
    │   │   │   └── HelloController.java
    │   │   ├── repository/
    │   │   │   ├── StudentRepository.java
    │   │   │   └── CourseRepository.java
    │   │   ├── service/
    │   │   │   ├── StudentService.java
    │   │   │   └── CourseService.java
    │   │   ├── config/
    │   │   │   └── SecurityConfig.java
    │   │   └── exception/
    │   │       ├── StudentNotFoundException.java
    │   │       ├── CourseNotFoundException.java
    │   │       └── GlobalExceptionHandler.java
    │   └── resources/
    │       └── application.properties
    └── test/
        ├── java/in/ranodeep/campusledger/
        │   └── StudentApiTest.java
        └── resources/
            └── application-test.properties
```

---

## 7. Database Schema

```sql
-- Experiment 4: studentdb database
CREATE DATABASE IF NOT EXISTS studentdb;

-- student table (created by Hibernate ddl-auto=update)
CREATE TABLE student (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL UNIQUE,
    branch   VARCHAR(255) NOT NULL,
    semester INT
);

-- course table (Experiment 6: FK to student)
CREATE TABLE course (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(255) NOT NULL UNIQUE,
    credits     INT,
    student_id  BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(id)
);
```

> **Note:** Hibernate creates these tables automatically with `spring.jpa.hibernate.ddl-auto=update`.

---

## 8. MySQL Setup

### Step 1 – Create the database

Open MySQL Workbench or MySQL Shell and run:
```sql
CREATE DATABASE IF NOT EXISTS studentdb;
```

### Step 2 – Configure credentials

Copy the example file and fill in your password:
```
copy application-local.properties.example src\main\resources\application-local.properties
```

Edit `application-local.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### Step 3 – Set environment variables (alternative)

```cmd
set DB_URL=jdbc:mysql://localhost:3306/studentdb?useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
set DB_USERNAME=root
set DB_PASSWORD=yourpassword
```

---

## 9. How to Run

### Prerequisites
- Java 17 or later (JDK)
- Maven 3.6+
- MySQL 8.0 running locally

### Run the application

```bash
# From the project root (CampusLedger/)
mvn spring-boot:run

# Or with environment variables
DB_PASSWORD=yourpassword mvn spring-boot:run
```

Application starts at: **http://localhost:8081**

### Run tests (uses H2 – no MySQL needed)

```bash
mvn test
```

---

## 10. API Endpoint Documentation

### Student Endpoints

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `/hello` | Public welcome message | ❌ None |
| GET | `/students` | List all students | ✅ Required |
| GET | `/students/{id}` | Get student by ID | ✅ Required |
| POST | `/students` | Create new student | ✅ Required |
| PUT | `/students/{id}` | Update student | ✅ Required |
| DELETE | `/students/{id}` | Delete student | ✅ Required |
| GET | `/students/search/name?name=Riya` | Exact name search | ✅ Required |
| GET | `/students/search/name-contains?keyword=an` | Partial name search | ✅ Required |
| GET | `/students/search/email?email=...` | Email search | ✅ Required |
| GET | `/students/search/branch?branch=CSE` | Branch filter | ✅ Required |
| GET | `/students/paged?page=0&size=5&sortBy=name&direction=asc` | Pagination + sort | ✅ Required |
| GET | `/students/search/paged?keyword=an&page=0&size=3` | Paginated search | ✅ Required |

### Course Endpoints

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `/courses` | List all courses | ✅ Required |
| GET | `/courses/{id}` | Get course by ID | ✅ Required |
| POST | `/courses/student/{studentId}` | Add course for student | ✅ Required |
| PUT | `/courses/{id}` | Update course | ✅ Required |
| DELETE | `/courses/{id}` | Delete course | ✅ Required |
| GET | `/courses/student/{studentId}` | Get courses by student | ✅ Required |

### Authentication

- **Username:** `admin` | **Password:** `campus123`
- **Username:** `student` | **Password:** `learn456`

---

## 11. Experiment-Wise Implementation

| Exp | Topic | Status |
|-----|-------|--------|
| 3 | In-memory CRUD REST API | ✅ |
| 4 | MySQL + Spring Data JPA | ✅ |
| 5 | Derived queries, Pagination, Sorting | ✅ |
| 6 | One-to-Many Student–Course Relationship | ✅ |
| 7 | Validation + GlobalExceptionHandler | ✅ |
| 8 | MockMvc Tests + cURL Commands | ✅ |
| 9 | Spring Security Basic Authentication | ✅ |

---

## 12. Security Implementation

Spring Security 6 is configured in `SecurityConfig.java`:

- **Public:** `GET /hello` — no authentication
- **Protected:** `/students/**`, `/courses/**` — HTTP Basic Auth required
- **Users:** Defined in-memory with BCrypt-hashed passwords
- **CSRF:** Disabled for REST API testing

Test with:
```cmd
curl -u admin:campus123 http://localhost:8081/students
curl http://localhost:8081/students        (returns 401)
curl http://localhost:8081/hello           (returns 200 – public)
```

---

## 13. Key Concepts Learned

1. **Spring Boot Auto-configuration** – reduces boilerplate configuration
2. **REST Architecture** – stateless HTTP communication with proper status codes
3. **JPA / Hibernate** – ORM mapping between Java objects and DB tables
4. **Spring Data JPA** – repository pattern with derived query methods
5. **Pagination & Sorting** – `PageRequest`, `Sort`, `Page<T>`
6. **JPA Relationships** – `@OneToMany`, `@ManyToOne`, CascadeType
7. **Bean Validation** – declarative input validation with `@Valid`, `@NotBlank`
8. **Exception Handling** – `@ControllerAdvice` for centralised error responses
9. **Spring Security** – authentication and URL-level access control
10. **MockMvc Testing** – integration testing without a live server

---

## 14. Learning Outcomes

After completing this project, I am able to:
- Build a production-style REST API with Spring Boot
- Design a layered architecture (Controller → Service → Repository)
- Configure MySQL connectivity and use JPA for persistence
- Write derived query methods and implement pagination
- Handle validation errors and exceptions professionally
- Secure REST endpoints with Spring Security Basic Auth
- Write automated integration tests with MockMvc

---

## 15. Limitations and Future Improvements

| Limitation | Future Improvement |
|------------|-------------------|
| In-memory user store for security | Database-backed UserDetailsService |
| No frontend | Add React or Angular frontend |
| Basic pagination | Add Swagger/OpenAPI documentation |
| Single DB profile | Add Docker Compose for easy setup |
| No JWT | Upgrade to JWT-based authentication |

---

*CampusLedger – Enterprise Java Lab Project | Ranodeep Malik*
