# Experiment Checklist – CampusLedger
# Author: Ranodeep Malik

## Enterprise Java Lab – Experiments 3–9

| # | Experiment | Status | Notes |
|---|-----------|--------|-------|
| 3 | REST API CRUD (In-memory) | ✅ Complete | Student CRUD via ArrayList in-memory, then migrated to DB |
| 4 | MySQL Database Connectivity & JPA | ✅ Complete | @Entity, @Repository, JpaRepository, application.properties |
| 5 | Spring Data JPA Repository (Queries/Pagination) | ✅ Complete | Derived queries, PageRequest, Sort, Page<T> |
| 6 | One-to-Many Student–Course Relationship | ✅ Complete | @OneToMany, @ManyToOne, CascadeType.ALL, orphanRemoval |
| 7 | Validation & Centralised Exception Handling | ✅ Complete | @Valid, @NotBlank, @Email, GlobalExceptionHandler, @ControllerAdvice |
| 8 | REST API Testing | ✅ Complete | MockMvc, JUnit 5, cURL commands in API_TESTING.md |
| 9 | Spring Security Basic Authentication | ✅ Complete | SecurityFilterChain, public /hello, protected /students /courses |

---

## Detailed Checklist per Experiment

### Experiment 3 – REST API CRUD
- [x] Student model with default and parameterized constructors
- [x] Getters and setters
- [x] GET all students → `GET /students`
- [x] POST create student → `POST /students`
- [x] GET by ID → `GET /students/{id}`
- [x] PUT update → `PUT /students/{id}`
- [x] DELETE → `DELETE /students/{id}`
- [x] ResponseEntity with proper HTTP status codes
- [x] @PathVariable and @RequestBody used correctly
- [x] In-memory phase complete; migrated to DB in Exp 4

### Experiment 4 – MySQL & Spring Data JPA
- [x] MySQL studentdb database created
- [x] MySQL Connector/J dependency in pom.xml
- [x] Spring Data JPA dependency in pom.xml
- [x] application.properties configured with datasource
- [x] Student annotated with @Entity, @Table, @Id, @GeneratedValue
- [x] StudentRepository extends JpaRepository<Student, Long>
- [x] All CRUD operations use database
- [x] Tables auto-created by Hibernate (ddl-auto=update)

### Experiment 5 – Repository Derived Queries & Pagination
- [x] findByName(String name)
- [x] findByNameContaining(String keyword)
- [x] findByEmail(String email)
- [x] findByBranch(String branch)
- [x] Search endpoints: /students/search/name, /search/name-contains, /search/email, /search/branch
- [x] Pagination via PageRequest.of(page, size, sort)
- [x] Sort.by(...).ascending() / .descending()
- [x] Page<Student> return type with metadata
- [x] /students/paged endpoint
- [x] /students/search/paged endpoint

### Experiment 6 – One-to-Many Relationship
- [x] Course entity created
- [x] @OneToMany on Student.courses (mappedBy="student")
- [x] @ManyToOne on Course.student
- [x] @JoinColumn(name="student_id") – FK in course table
- [x] CascadeType.ALL on @OneToMany
- [x] orphanRemoval = true
- [x] CourseRepository extends JpaRepository<Course, Long>
- [x] CourseService handles relationship operations
- [x] CourseController provides /courses endpoints
- [x] @JsonManagedReference / @JsonBackReference to prevent JSON loops
- [x] student_id FK verified in MySQL

### Experiment 7 – Validation & Exception Handling
- [x] spring-boot-starter-validation in pom.xml
- [x] @NotBlank on name, email, branch fields
- [x] @Email on email field
- [x] @Valid on @RequestBody in both controllers
- [x] GlobalExceptionHandler with @ControllerAdvice
- [x] MethodArgumentNotValidException → 400 with field errors
- [x] StudentNotFoundException → 404
- [x] CourseNotFoundException → 404
- [x] Generic Exception → 500
- [x] Error response includes timestamp, status, error, message

### Experiment 8 – API & Automated Testing
- [x] JUnit 5 test class: StudentApiTest.java
- [x] @SpringBootTest + @AutoConfigureMockMvc
- [x] @ActiveProfiles("test") – uses H2, no MySQL needed
- [x] @WithMockUser for security in tests
- [x] Create student success test (201)
- [x] Get all students (200)
- [x] Get by ID – found (200)
- [x] Get by ID – not found (404)
- [x] Update student (200)
- [x] Delete student (204)
- [x] Validation failure – blank name (400)
- [x] Validation failure – invalid email (400)
- [x] Unauthenticated access – 401
- [x] Public /hello – 200 without auth
- [x] API_TESTING.md with all Windows CMD cURL commands

### Experiment 9 – Spring Security
- [x] spring-boot-starter-security in pom.xml
- [x] SecurityConfig.java with @Configuration @EnableWebSecurity
- [x] SecurityFilterChain bean
- [x] HTTP Basic Authentication enabled
- [x] GET /hello – permitAll() (public)
- [x] /students/** – authenticated()
- [x] /courses/** – authenticated()
- [x] InMemoryUserDetailsManager with two users (admin, student)
- [x] BCryptPasswordEncoder for password hashing
- [x] CSRF disabled for REST API
- [x] 401 on wrong credentials verified
- [x] 200 on correct credentials verified

---

## Files Created
- `pom.xml`
- `src/main/java/in/ranodeep/campusledger/CampusLedgerApplication.java`
- `src/main/java/in/ranodeep/campusledger/model/Student.java`
- `src/main/java/in/ranodeep/campusledger/model/Course.java`
- `src/main/java/in/ranodeep/campusledger/repository/StudentRepository.java`
- `src/main/java/in/ranodeep/campusledger/repository/CourseRepository.java`
- `src/main/java/in/ranodeep/campusledger/service/StudentService.java`
- `src/main/java/in/ranodeep/campusledger/service/CourseService.java`
- `src/main/java/in/ranodeep/campusledger/controller/StudentController.java`
- `src/main/java/in/ranodeep/campusledger/controller/CourseController.java`
- `src/main/java/in/ranodeep/campusledger/controller/HelloController.java`
- `src/main/java/in/ranodeep/campusledger/config/SecurityConfig.java`
- `src/main/java/in/ranodeep/campusledger/exception/StudentNotFoundException.java`
- `src/main/java/in/ranodeep/campusledger/exception/CourseNotFoundException.java`
- `src/main/java/in/ranodeep/campusledger/exception/GlobalExceptionHandler.java`
- `src/main/resources/application.properties`
- `src/test/java/in/ranodeep/campusledger/StudentApiTest.java`
- `src/test/resources/application-test.properties`
- `README.md`
- `API_TESTING.md`
- `PROJECT_STATUS.md`
- `EXPERIMENT_CHECKLIST.md`
- `VIVA_PREPARATION.md`
- `application-local.properties.example`
- `.gitignore`
