package in.ranodeep.campusledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CampusLedger – Student Management System
 * Enterprise Java Lab Project
 *
 * Author: Ranodeep Malik
 * Course: Enterprise Java
 *
 * Entry point for the Spring Boot application.
 * @SpringBootApplication combines:
 *   - @Configuration      : marks this as a source of bean definitions
 *   - @EnableAutoConfiguration : tells Spring Boot to auto-configure based on classpath
 *   - @ComponentScan      : scans for Spring components in this package and sub-packages
 */
@SpringBootApplication
public class CampusLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusLedgerApplication.class, args);
    }
}
