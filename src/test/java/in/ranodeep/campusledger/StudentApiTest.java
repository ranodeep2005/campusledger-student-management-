package in.ranodeep.campusledger;

import in.ranodeep.campusledger.model.Student;
import in.ranodeep.campusledger.repository.StudentRepository;
import in.ranodeep.campusledger.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * StudentApiTest – Automated API tests using Spring Boot Test + MockMvc.
 *
 * Experiment 8:
 *   @SpringBootTest      – loads the full application context.
 *   @AutoConfigureMockMvc– provides MockMvc to simulate HTTP requests without a real server.
 *   @ActiveProfiles("test") – uses application-test.properties (H2 in-memory DB).
 *   @WithMockUser        – simulates an authenticated user for Spring Security.
 *
 * MockMvc lets us test REST endpoints without starting a real HTTP server,
 * making tests fast and isolated.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @BeforeEach
    void setUp() {
        studentRepository.deleteAll();
    }

    // ── Successful creation test ──────────────────────────────────────────────

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void createStudent_validData_returns201() throws Exception {
        String json = """
                {
                  "name": "Priya Sharma",
                  "email": "priya.sharma@campusledger.in",
                  "branch": "CSE",
                  "semester": 4
                }
                """;

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Priya Sharma")))
                .andExpect(jsonPath("$.email", is("priya.sharma@campusledger.in")))
                .andExpect(jsonPath("$.id", notNullValue()));
    }

    // ── Get all students ──────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getAllStudents_returnsOk() throws Exception {
        // Pre-load one student
        studentRepository.save(new Student("Arjun Verma", "arjun@test.in", "ECE", 3));

        mockMvc.perform(get("/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Arjun Verma")));
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getStudentById_exists_returnsStudent() throws Exception {
        Student saved = studentRepository.save(new Student("Neha Gupta", "neha@test.in", "IT", 2));

        mockMvc.perform(get("/students/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Neha Gupta")));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getStudentById_notExists_returns404() throws Exception {
        mockMvc.perform(get("/students/9999"))
                .andExpect(status().isNotFound());
    }

    // ── Update student ────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void updateStudent_validData_returnsUpdated() throws Exception {
        Student saved = studentRepository.save(new Student("Rohit Das", "rohit@test.in", "ME", 5));

        String updatedJson = """
                {
                  "name": "Rohit Das",
                  "email": "rohit.updated@test.in",
                  "branch": "ME",
                  "semester": 6
                }
                """;

        mockMvc.perform(put("/students/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semester", is(6)))
                .andExpect(jsonPath("$.email", is("rohit.updated@test.in")));
    }

    // ── Delete student ────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void deleteStudent_exists_returns204() throws Exception {
        Student saved = studentRepository.save(new Student("Kavya Reddy", "kavya@test.in", "CSE", 1));

        mockMvc.perform(delete("/students/" + saved.getId()))
                .andExpect(status().isNoContent());
    }

    // ── Validation failure tests (Experiment 7 + 8) ───────────────────────────

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void createStudent_missingName_returns400() throws Exception {
        String json = """
                {
                  "name": "",
                  "email": "test@test.in",
                  "branch": "CSE",
                  "semester": 2
                }
                """;

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void createStudent_invalidEmail_returns400() throws Exception {
        String json = """
                {
                  "name": "Test Student",
                  "email": "not-an-email",
                  "branch": "ECE",
                  "semester": 3
                }
                """;

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    // ── Security: Unauthenticated access returns 401 (Experiment 9) ───────────

    @Test
    void getStudents_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/students"))
                .andExpect(status().isUnauthorized());
    }

    // ── Public endpoint: /hello is accessible without auth ────────────────────

    @Test
    void helloEndpoint_noAuth_returnsOk() throws Exception {
        mockMvc.perform(get("/hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("CampusLedger")));
    }
}
