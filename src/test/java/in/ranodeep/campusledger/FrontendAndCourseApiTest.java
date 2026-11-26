package in.ranodeep.campusledger;

import in.ranodeep.campusledger.model.Student;
import in.ranodeep.campusledger.repository.CourseRepository;
import in.ranodeep.campusledger.repository.StudentRepository;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verifies public static frontend resources (login page, dashboard, CSS, JS, favicon)
 * and full Course CRUD endpoints with HTTP Basic Auth.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FrontendAndCourseApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @BeforeEach
    void setUp() {
        courseRepository.deleteAll();
        studentRepository.deleteAll();
    }

    @Test
    void staticFrontendResources_noAuth_areAccessibleWithout401() throws Exception {
        mockMvc.perform(get("/login.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("CampusLedger")));

        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("CampusLedger")));

        mockMvc.perform(get("/css/style.css"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/js/auth.js"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/js/api.js"))
                .andExpect(status().isOk());

        // /favicon.ico must not trigger a 401 Basic Auth browser prompt
        mockMvc.perform(get("/favicon.ico"))
                .andExpect(status().is(not(401)));
    }

    @Test
    void loginCheck_validAndInvalidBasicAuth() throws Exception {
        mockMvc.perform(get("/students/paged?page=0&size=1")
                        .with(httpBasic("admin", "campus123")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/students/paged?page=0&size=1")
                        .with(httpBasic("admin", "wrongpassword")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void courseCrud_fullLifecycle_succeeds() throws Exception {
        Student student = studentRepository.save(
                new Student("Aarav Mehta", "aarav.mehta@campusledger.in", "CSE", 4));

        String createJson = """
                {
                  "courseName": "Operating Systems",
                  "courseCode": "CS302",
                  "credits": 4
                }
                """;

        // Create
        mockMvc.perform(post("/courses/student/" + student.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseName", is("Operating Systems")))
                .andExpect(jsonPath("$.courseCode", is("CS302")))
                .andExpect(jsonPath("$.credits", is(4)));

        Long courseId = courseRepository.findByStudentId(student.getId()).get(0).getId();

        // Read all & by student & by ID
        mockMvc.perform(get("/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/courses/student/" + student.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseCode", is("CS302")));

        mockMvc.perform(get("/courses/" + courseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseName", is("Operating Systems")));

        // Update
        String updateJson = """
                {
                  "courseName": "Advanced Operating Systems",
                  "courseCode": "CS302",
                  "credits": 5
                }
                """;
        mockMvc.perform(put("/courses/" + courseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseName", is("Advanced Operating Systems")))
                .andExpect(jsonPath("$.credits", is(5)));

        // Delete
        mockMvc.perform(delete("/courses/" + courseId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/courses/" + courseId))
                .andExpect(status().isNotFound());
    }
}
