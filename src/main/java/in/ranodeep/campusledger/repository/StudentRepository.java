package in.ranodeep.campusledger.repository;

import in.ranodeep.campusledger.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * StudentRepository – Data access layer for Student entity.
 *
 * Experiment 4 : Extends JpaRepository to get full CRUD out of the box.
 * Experiment 5 : Derived query methods – Spring generates SQL from method names.
 *
 * JpaRepository<Student, Long>:
 *   - Student = entity type
 *   - Long    = primary key type
 *
 * Spring Data JPA auto-implements these methods at runtime – no SQL needed.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Finds all students whose name exactly matches (case-sensitive by default)
    List<Student> findByName(String name);

    // LIKE %keyword% search on the name field (Experiment 5)
    List<Student> findByNameContaining(String keyword);

    // Exact email lookup
    Optional<Student> findByEmail(String email);

    // Find by branch
    List<Student> findByBranch(String branch);

    // Paginated name search (returns a Page<Student> with metadata)
    Page<Student> findByNameContaining(String keyword, Pageable pageable);
}
