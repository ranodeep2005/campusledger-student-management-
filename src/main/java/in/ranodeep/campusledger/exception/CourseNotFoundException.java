package in.ranodeep.campusledger.exception;

/**
 * CourseNotFoundException – Custom runtime exception.
 *
 * Thrown when a course is not found by ID.
 * Caught by GlobalExceptionHandler to return a meaningful 404 response.
 */
public class CourseNotFoundException extends RuntimeException {

    public CourseNotFoundException(Long id) {
        super("Course not found with id: " + id);
    }
}
