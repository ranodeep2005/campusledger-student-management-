package in.ranodeep.campusledger.service;

import in.ranodeep.campusledger.exception.CourseNotFoundException;
import in.ranodeep.campusledger.exception.StudentNotFoundException;
import in.ranodeep.campusledger.model.Course;
import in.ranodeep.campusledger.model.Student;
import in.ranodeep.campusledger.repository.CourseRepository;
import in.ranodeep.campusledger.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CourseService – Business logic for course management.
 *
 * Experiment 6: handles the Student→Course relationship operations.
 */
@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public CourseService(CourseRepository courseRepository, StudentRepository studentRepository) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id));
    }

    /**
     * Enrols a new course under a specific student.
     * Fetches the Student first so the FK (student_id) is properly set.
     */
    public Course addCourseToStudent(Long studentId, Course course) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));
        course.setStudent(student);
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course updatedData) {
        Course existing = getCourseById(id);
        existing.setCourseName(updatedData.getCourseName());
        existing.setCourseCode(updatedData.getCourseCode());
        existing.setCredits(updatedData.getCredits());
        return courseRepository.save(existing);
    }

    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new CourseNotFoundException(id);
        }
        courseRepository.deleteById(id);
    }

    public List<Course> getCoursesByStudent(Long studentId) {
        return courseRepository.findByStudentId(studentId);
    }
}
