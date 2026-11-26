package in.ranodeep.campusledger.controller;

import in.ranodeep.campusledger.model.Course;
import in.ranodeep.campusledger.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CourseController – REST API for Course management.
 *
 * Experiment 6: Implements Student→Course relationship endpoints.
 * A course always belongs to a student; student_id is required in the URL.
 */
@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ── GET /courses  ─────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // ── GET /courses/{id}  ────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // ── POST /courses/student/{studentId}  ───────────────────────────────────
    // Enrols a course under a specific student.
    @PostMapping("/student/{studentId}")
    public ResponseEntity<Course> addCourse(@PathVariable Long studentId,
                                            @Valid @RequestBody Course course) {
        Course saved = courseService.addCourseToStudent(studentId, course);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── PUT /courses/{id}  ───────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id,
                                               @Valid @RequestBody Course course) {
        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    // ── DELETE /courses/{id}  ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /courses/student/{studentId}  ────────────────────────────────────
    // Lists all courses for a given student.
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Course>> getCoursesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getCoursesByStudent(studentId));
    }
}
