package in.ranodeep.campusledger.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * HelloController – Simple public endpoint for Experiment 9 (Spring Security).
 *
 * GET /hello → publicly accessible (no authentication needed).
 * This demonstrates the contrast with the protected /students and /courses endpoints.
 */
@RestController
public class HelloController {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to CampusLedger!",
                "status",  "public endpoint – no auth required"
        ));
    }
}
