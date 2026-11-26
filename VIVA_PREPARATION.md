# Viva Preparation – CampusLedger
# Author: Ranodeep Malik | Enterprise Java Lab

---

## Experiment 3 – REST API CRUD

**Q: What is a REST API?**  
A: REST (Representational State Transfer) is an architectural style for building web APIs. It uses standard HTTP methods (GET, POST, PUT, DELETE) and returns JSON data. REST APIs are stateless – each request is independent.

**Q: What is @RestController? Difference from @Controller?**  
A: `@RestController = @Controller + @ResponseBody`. It means every method in the class automatically converts its return value to JSON and writes it directly to the HTTP response. With plain `@Controller` you'd need to add `@ResponseBody` to each method manually or use a view resolver.

**Q: What is ResponseEntity?**  
A: `ResponseEntity<T>` gives you full control over the HTTP response – body, headers, and status code. For example: `ResponseEntity.status(HttpStatus.CREATED).body(savedStudent)` returns HTTP 201 with the student JSON.

**Q: What is @PathVariable? Example?**  
A: `@PathVariable` extracts a value from the URL path. In `GET /students/{id}`, the method `getStudentById(@PathVariable Long id)` captures the `{id}` from the URL.

**Q: What is @RequestBody?**  
A: `@RequestBody` deserialises the JSON in the HTTP request body into a Java object. When POST `/students` is called with a JSON body, `@RequestBody Student student` converts that JSON to a Student object.

---

## Experiment 4 – MySQL & Spring Data JPA

**Q: What is JPA? What is Hibernate?**  
A: JPA (Jakarta Persistence API) is a specification that defines how Java objects map to database tables. Hibernate is an implementation of JPA. Spring Boot auto-configures Hibernate as the JPA provider.

**Q: What does @Entity do?**  
A: `@Entity` tells Hibernate that this Java class corresponds to a database table. Without it, the class is just a plain Java object.

**Q: What is @Id and @GeneratedValue?**  
A: `@Id` marks the field as the primary key. `@GeneratedValue(strategy = GenerationType.IDENTITY)` tells the database to auto-increment the ID value.

**Q: What is JpaRepository? What do you get out of the box?**  
A: `JpaRepository<Entity, IDType>` is a Spring Data interface that provides ~18 methods automatically:
- `findAll()`, `findById()`, `save()`, `deleteById()`, `existsById()`, `count()`, pagination, sorting…
You don't write any implementation – Spring generates it at runtime.

**Q: What is ddl-auto=update?**  
A: It tells Hibernate to automatically update the database schema to match the entity classes. It adds missing columns/tables but doesn't drop existing data. For production, use `validate` instead.

---

## Experiment 5 – Derived Queries & Pagination

**Q: What is a derived query method?**  
A: Spring Data JPA generates SQL automatically from the method name. `findByNameContaining(String keyword)` becomes `SELECT * FROM student WHERE name LIKE %keyword%`. No SQL needed!

**Q: How does pagination work?**  
A: `PageRequest.of(page, size, sort)` creates a `Pageable` object. When passed to `findAll(pageable)`, it returns a `Page<Student>` with:
- Content (the list of students for that page)
- Total elements (how many exist overall)
- Total pages
- Current page number

**Q: What is the difference between List and Page return types?**  
A: `List<Student>` returns all matching records. `Page<Student>` returns a slice plus metadata (total count, page info) – essential for frontend pagination.

---

## Experiment 6 – One-to-Many Relationship

**Q: What is a One-to-Many relationship?**  
A: One student can be enrolled in many courses, but each course belongs to exactly one student. In the DB, this is represented by a `student_id` foreign key column in the `course` table.

**Q: What is @OneToMany and mappedBy?**  
A: `@OneToMany(mappedBy="student")` on the Student side says "the other side (Course.student) owns this relationship." The `mappedBy` refers to the field name in Course.

**Q: What is CascadeType.ALL?**  
A: When you save/delete a Student, the operation cascades to all associated Courses. If you delete a student, their courses are also deleted automatically.

**Q: Why is orphanRemoval=true needed?**  
A: If you remove a Course from student.getCourses() list (without explicitly deleting it), `orphanRemoval=true` automatically deletes it from the database too.

**Q: What problem does @JsonManagedReference / @JsonBackReference solve?**  
A: Without them, Jackson (JSON serialiser) loops infinitely: Student → Courses → Student → Courses... `@JsonManagedReference` serialises the student's list of courses. `@JsonBackReference` on Course.student stops the loop by not serialising it back.

---

## Experiment 7 – Validation & Exception Handling

**Q: What is Bean Validation (@Valid)?**  
A: When `@Valid` is on a `@RequestBody` parameter, Spring automatically validates the object using annotations like `@NotBlank`, `@Email`. If validation fails, it throws `MethodArgumentNotValidException`.

**Q: What is @ControllerAdvice?**  
A: A special class that intercepts exceptions thrown from any controller in the application. Combined with `@ExceptionHandler`, it provides centralised error handling.

**Q: What happens without GlobalExceptionHandler?**  
A: Spring returns a generic "Whitelabel Error Page" with limited info. With GlobalExceptionHandler, every error returns a structured JSON: `{timestamp, status, error, message}`.

---

## Experiment 8 – API Testing

**Q: What is MockMvc?**  
A: MockMvc simulates HTTP requests inside a Spring context without actually starting a web server. It's faster than integration tests with a real server and doesn't need MySQL (uses H2 in test profile).

**Q: What is @SpringBootTest?**  
A: Loads the full Spring application context for testing – all beans, security, etc. Combined with `@AutoConfigureMockMvc`, it gives access to MockMvc.

**Q: What is @WithMockUser?**  
A: Simulates an authenticated user in the Spring Security context for tests. Without it, all protected endpoints return 401 during testing.

**Q: What is @ActiveProfiles("test")?**  
A: Activates the "test" profile, which loads `application-test.properties`. This switches to H2 in-memory database so tests don't need MySQL running.

---

## Experiment 9 – Spring Security

**Q: What is HTTP Basic Authentication?**  
A: The client sends a Base64-encoded `username:password` in the `Authorization` header of every request. The server decodes and validates it. It's simple but must be used over HTTPS in production.

**Q: What is SecurityFilterChain?**  
A: A chain of security filters that every HTTP request passes through. The `securityFilterChain` bean defines which URLs are public and which need authentication.

**Q: What is BCryptPasswordEncoder?**  
A: A password hashing algorithm that generates a unique hash for each password even if two users have the same password (using salting). Never store plain-text passwords.

**Q: Why is CSRF disabled?**  
A: CSRF (Cross-Site Request Forgery) protection is designed for browser-based sessions. REST APIs use stateless authentication (Basic Auth, JWT), so CSRF is not applicable and is disabled for API testing with cURL/Postman.

**Q: How does permitAll() vs authenticated() work?**  
A: `.requestMatchers("/hello").permitAll()` allows anyone to access `/hello`. `.requestMatchers("/students/**").authenticated()` requires valid credentials. If credentials are missing or wrong, Spring returns 401 Unauthorized.

---

## General Spring Boot Questions

**Q: What does @SpringBootApplication do?**  
A: It's a convenience annotation combining:
- `@Configuration` – marks as configuration class
- `@EnableAutoConfiguration` – auto-configures based on classpath dependencies  
- `@ComponentScan` – scans the package for Spring components (@Controller, @Service, @Repository, etc.)

**Q: What is the difference between @Autowired and constructor injection?**  
A: Constructor injection (used in this project) is preferred because:
- Makes dependencies explicit (you can see what a class needs)
- Easier to test (you can pass mock objects)
- The class is immutable after construction
- Avoids circular dependency issues

**Q: What is application.properties?**  
A: Configuration file for Spring Boot settings – database URL, server port, JPA settings, logging. Spring Boot auto-reads this at startup.

**Q: Why use environment variables for the DB password?**  
A: Hardcoding passwords in source code is a security risk (anyone with code access sees the password). Environment variables keep credentials outside the codebase and git history.
