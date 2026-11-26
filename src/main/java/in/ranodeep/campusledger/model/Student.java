package in.ranodeep.campusledger.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

/**
 * Student – Core entity for CampusLedger.
 *
 * Experiment 3  : Plain POJO used by in-memory controller.
 * Experiment 4  : @Entity + @Id turn it into a JPA entity backed by MySQL.
 * Experiment 6  : @OneToMany links each student to their enrolled courses.
 * Experiment 7  : @NotBlank/@Email enforce input validation at the API boundary.
 *
 * Table name defaults to 'student' (lowercase class name).
 */
@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name must not be blank")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be a valid email address")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Branch must not be blank")
    @Column(nullable = false)
    private String branch;

    @Column(name = "semester")
    private int semester;

    /**
     * One student can be enrolled in many courses.
     * CascadeType.ALL  – persist/delete courses when student is persisted/deleted.
     * orphanRemoval    – removes a course record if removed from this list.
     * @JsonManagedReference prevents infinite recursion when serialising to JSON.
     */
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Course> courses = new ArrayList<>();

    // ── Constructors ──────────────────────────────────────────────────────────

    public Student() {}

    public Student(String name, String email, String branch, int semester) {
        this.name = name;
        this.email = email;
        this.branch = branch;
        this.semester = semester;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public List<Course> getCourses() { return courses; }
    public void setCourses(List<Course> courses) { this.courses = courses; }

    @Override
    public String toString() {
        return "Student{id=" + id + ", name='" + name + "', email='" + email +
               "', branch='" + branch + "', semester=" + semester + "}";
    }
}
