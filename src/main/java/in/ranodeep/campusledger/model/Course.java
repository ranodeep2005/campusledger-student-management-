package in.ranodeep.campusledger.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Course – Represents an academic course a student is enrolled in.
 *
 * Experiment 6 : @ManyToOne creates the student_id FK column in the 'course' table.
 *                @JsonBackReference prevents the cyclic JSON loop (course → student → courses → ...).
 *
 * One student → Many courses (the "many" side lives here).
 */
@Entity
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Course name must not be blank")
    @Column(nullable = false)
    private String courseName;

    @NotBlank(message = "Course code must not be blank")
    @Column(nullable = false, unique = true)
    private String courseCode;

    @Column
    private int credits;

    /**
     * Many courses belong to one student.
     * @JoinColumn defines the FK column name in the 'course' table.
     * @JsonBackReference – the "back" side is not serialised, breaking the loop.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference
    private Student student;

    // ── Constructors ──────────────────────────────────────────────────────────

    public Course() {}

    public Course(String courseName, String courseCode, int credits, Student student) {
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.credits = credits;
        this.student = student;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    @Override
    public String toString() {
        return "Course{id=" + id + ", courseName='" + courseName + "', courseCode='" + courseCode +
               "', credits=" + credits + "}";
    }
}
