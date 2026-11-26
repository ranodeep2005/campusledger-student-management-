package in.ranodeep.campusledger.exception;

/**
 * StudentNotFoundException – Custom runtime exception.
 *
 * Experiment 7: Thrown when a student is not found by ID or email.
 * Caught by GlobalExceptionHandler to return a meaningful 404 response.
 */
public class StudentNotFoundException extends RuntimeException {

    public StudentNotFoundException(Long id) {
        super("Student not found with id: " + id);
    }

    public StudentNotFoundException(String message) {
        super(message);
    }
}
