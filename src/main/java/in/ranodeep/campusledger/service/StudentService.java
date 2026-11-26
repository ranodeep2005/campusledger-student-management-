package in.ranodeep.campusledger.service;

import in.ranodeep.campusledger.exception.StudentNotFoundException;
import in.ranodeep.campusledger.model.Student;
import in.ranodeep.campusledger.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * StudentService – Business logic layer for student operations.
 *
 * Separates concerns: the controller handles HTTP, the service handles logic,
 * the repository handles database access.
 *
 * @Service – marks this as a Spring-managed service bean.
 *
 * Covers: Experiment 4 (CRUD), Experiment 5 (search, pagination, sorting),
 *         Experiment 7 (validation flows).
 */
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    // Constructor injection – preferred over @Autowired field injection
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // ── CRUD operations ───────────────────────────────────────────────────────

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student updatedData) {
        Student existing = getStudentById(id);  // throws 404 if not found
        existing.setName(updatedData.getName());
        existing.setEmail(updatedData.getEmail());
        existing.setBranch(updatedData.getBranch());
        existing.setSemester(updatedData.getSemester());
        return studentRepository.save(existing);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException(id);
        }
        studentRepository.deleteById(id);
    }

    // ── Search operations (Experiment 5) ──────────────────────────────────────

    public List<Student> findByName(String name) {
        return studentRepository.findByName(name);
    }

    public List<Student> findByNameContaining(String keyword) {
        return studentRepository.findByNameContaining(keyword);
    }

    public Student findByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("No student with email: " + email));
    }

    public List<Student> findByBranch(String branch) {
        return studentRepository.findByBranch(branch);
    }

    // ── Pagination and Sorting (Experiment 5) ─────────────────────────────────

    /**
     * Returns a paginated, sorted list of all students.
     * PageRequest.of(page, size, sort) builds a Pageable from the given params.
     */
    public Page<Student> getStudentsPaged(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return studentRepository.findAll(pageable);
    }

    /**
     * Paginated search by name keyword.
     */
    public Page<Student> searchByNamePaged(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return studentRepository.findByNameContaining(keyword, pageable);
    }
}
