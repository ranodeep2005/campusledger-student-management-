package in.ranodeep.campusledger.repository;

import in.ranodeep.campusledger.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CourseRepository – Data access layer for Course entity.
 *
 * Experiment 6 : Provides CRUD and relationship queries for courses.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Fetch all courses belonging to a particular student
    List<Course> findByStudentId(Long studentId);

    // Find courses by name (partial match)
    List<Course> findByCourseNameContaining(String keyword);
}
