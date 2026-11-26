package in.ranodeep.campusledger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SecurityConfig – Custom Spring Security configuration.
 *
 * Experiment 9:
 *   - Public endpoint  : GET /hello (no auth required)
 *   - Protected endpoints: /students/**, /courses/** (HTTP Basic Auth required)
 *
 * Credentials are defined here in-memory for lab demonstration.
 * In production, use a database-backed UserDetailsService.
 *
 * IMPORTANT: Do not commit real passwords to GitHub.
 *            These are intentionally simple local dev credentials.
 *
 * @Configuration – marks this as a Spring configuration class.
 * @EnableWebSecurity – activates Spring Security's web security support.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * SecurityFilterChain – defines the security rules (which URLs need auth).
     *
     * httpBasic() enables HTTP Basic Authentication (username:password in request header).
     * csrf().disable() – disabled for REST API testing (cURL / Postman).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoint – accessible without credentials
                .requestMatchers(HttpMethod.GET, "/hello").permitAll()
                // All /students and /courses endpoints require authentication
                .requestMatchers("/students/**").authenticated()
                .requestMatchers("/courses/**").authenticated()
                // Anything else – also authenticated (safe default)
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {});  // Enable HTTP Basic Auth

        return http.build();
    }

    /**
     * UserDetailsService – defines in-memory users for HTTP Basic Auth.
     *
     * Username: admin    Password: campus123    Role: ADMIN
     * Username: student  Password: learn456     Role: USER
     *
     * BCryptPasswordEncoder hashes the password securely before storing.
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        var admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("campus123"))
                .roles("ADMIN")
                .build();

        var student = User.builder()
                .username("student")
                .password(passwordEncoder.encode("learn456"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, student);
    }

    /**
     * PasswordEncoder – BCrypt is the industry-standard password hashing algorithm.
     * Never store plain-text passwords.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
