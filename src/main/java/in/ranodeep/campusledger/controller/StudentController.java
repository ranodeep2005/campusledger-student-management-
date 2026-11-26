package in.ranodeep.campusledger.controller;

import in.ranodeep.campusledger.model.Student;
import in.ranodeep.campusledger.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * StudentController – REST API controller for Student operations.
 *
 * Experiment 3  : In-memory CRUD endpoints (service delegates to ArrayList initially).
 * Experiment 4  : Service now delegates to JPA repository backed by MySQL.
 * Experiment 5  : Search, pagination, and sorting endpoints.
 * Experiment 7  : @Valid triggers bean validation on request bodies.
 *
 * @RestController = @Controller + @ResponseBody (every return value → JSON response)
 * @RequestMapping sets the base URL for all endpoints in this class.
 */
@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // ── GET /students  ────────────────────────────────────────────────────────
    // Returns all students. HTTP 200 OK.

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    // ── GET /students/{id}  ───────────────────────────────────────────────────
    // Returns a single student by ID. 404 if not found (thrown by service).

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    // ── POST /students  ───────────────────────────────────────────────────────
    // Creates a new student. @Valid validates the request body fields.
    // Returns 201 Created with the saved student.

    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        Student saved = studentService.createStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── PUT /students/{id}  ───────────────────────────────────────────────────
    // Updates an existing student. Returns 200 OK with updated data.

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id,
                                                 @Valid @RequestBody Student student) {
        Student updated = studentService.updateStudent(id, student);
        return ResponseEntity.ok(updated);
    }

    // ── DELETE /students/{id}  ────────────────────────────────────────────────
    // Deletes a student. Returns 204 No Content (no body needed).

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /students/search/name?name=Riya  ─────────────────────────────────
    // Exact name match (Experiment 5 derived query).

    @GetMapping("/search/name")
    public ResponseEntity<List<Student>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(studentService.findByName(name));
    }

    // ── GET /students/search/name-contains?keyword=an  ───────────────────────
    // Partial name match using LIKE %keyword% (Experiment 5).

    @GetMapping("/search/name-contains")
    public ResponseEntity<List<Student>> searchByNameContaining(@RequestParam String keyword) {
        return ResponseEntity.ok(studentService.findByNameContaining(keyword));
    }

    // ── GET /students/search/email?email=...  ────────────────────────────────

    @GetMapping("/search/email")
    public ResponseEntity<Student> searchByEmail(@RequestParam String email) {
        return ResponseEntity.ok(studentService.findByEmail(email));
    }

    // ── GET /students/search/branch?branch=CSE  ──────────────────────────────

    @GetMapping("/search/branch")
    public ResponseEntity<List<Student>> searchByBranch(@RequestParam String branch) {
        return ResponseEntity.ok(studentService.findByBranch(branch));
    }

    // ── GET /students/paged?page=0&size=5&sortBy=name&direction=asc  ─────────
    // Returns paginated results (Experiment 5). Page<Student> includes metadata.

    @GetMapping("/paged")
    public ResponseEntity<Page<Student>> getStudentsPaged(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "5")  int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String direction) {
        return ResponseEntity.ok(studentService.getStudentsPaged(page, size, sortBy, direction));
    }

    // ── GET /students/search/paged?keyword=an&page=0&size=3  ─────────────────
    // Paginated search results.

    @GetMapping("/search/paged")
    public ResponseEntity<Page<Student>> searchPaged(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(studentService.searchByNamePaged(keyword, page, size));
    }
}
