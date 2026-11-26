package in.ranodeep.campusledger.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler – Centralised error handling for the entire application.
 *
 * Experiment 7:
 *   @ControllerAdvice   – intercepts exceptions thrown from any @Controller in the app.
 *   @ExceptionHandler   – specifies which exception type this method handles.
 *
 * Without this, Spring would return a generic 500 or ugly Whitelabel error page.
 * With this, every error returns a clean JSON payload with timestamp, status, and message.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors from @Valid on request bodies.
     * Returns 400 Bad Request with field-level error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> response = buildErrorBody(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                fieldErrors.toString()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles StudentNotFoundException (404 Not Found).
     */
    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleStudentNotFound(StudentNotFoundException ex) {
        Map<String, Object> response = buildErrorBody(
                HttpStatus.NOT_FOUND.value(),
                "Student not found",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles CourseNotFoundException (404 Not Found).
     */
    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCourseNotFound(CourseNotFoundException ex) {
        Map<String, Object> response = buildErrorBody(
                HttpStatus.NOT_FOUND.value(),
                "Course not found",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Catch-all handler for unexpected exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = buildErrorBody(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private Map<String, Object> buildErrorBody(int status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status);
        body.put("error", error);
        body.put("message", message);
        return body;
    }
}
