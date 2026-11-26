# CampusLedger – Frontend Guide

> **Author:** Ranodeep Malik
> **Tech Stack:** HTML, CSS, Vanilla JavaScript, Bootstrap 5
> **Backend:** Spring Boot 3.3.5 (port 8081)

This guide explains how to run, access and use the CampusLedger frontend.

---

## 1. Frontend Folder Structure

```
src/main/resources/static/
├── index.html          Main ERP dashboard (Dashboard, Students, Courses)
├── login.html          Login page (HTTP Basic Authentication)
├── css/
│   └── style.css       ERP theme – navy sidebar, white cards, light grey background
└── js/
    ├── auth.js         HTTP Basic Auth helper – login, logout, session management
    ├── api.js          Centralized API client – all fetch() calls go through this
    ├── app.js          Navigation, dashboard KPIs, activity log, toast notifications
    ├── students.js     Student CRUD, search, pagination, sorting
    └── courses.js      Course CRUD, student filter, enrollment management
```

---

## 2. How to Start the Application

### Prerequisites

- **Java 21+** (JDK installed)
- **Maven 3.6+**
- **MySQL 8.0** running locally
- Database `studentdb` created:
  ```sql
  CREATE DATABASE IF NOT EXISTS studentdb;
  ```

### Configure MySQL Password

**Option A – Environment Variables (Recommended)**

In IntelliJ:
1. Open **Run → Edit Configurations**
2. Select your Spring Boot run configuration
3. Add environment variables:
   ```
   DB_PASSWORD=your_mysql_password
   ```

Or via terminal:
```cmd
set DB_PASSWORD=your_mysql_password
mvn spring-boot:run
```

**Option B – Local Properties File**

1. Copy the example:
   ```
   copy application-local.properties.example src\main\resources\application-local.properties
   ```
2. Edit `application-local.properties` and set your password
3. Run with: `--spring.profiles.active=local`

### Start the Server

```cmd
mvn spring-boot:run
```

The application starts at **http://localhost:8081**.

---

## 3. How to Access the Frontend

| Page | URL |
|------|-----|
| Login Page | `http://localhost:8081/login.html` |
| Dashboard | `http://localhost:8081/index.html` (or just `http://localhost:8081/`) |

### First-time Access

1. Open `http://localhost:8081/login.html` in your browser.
2. The page checks backend connectivity via `/hello` (shows "Backend online" if connected).
3. Enter your credentials and click **Sign In**.

### Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `campus123` | ADMIN |
| `student` | `learn456` | USER |

These credentials are defined in `SecurityConfig.java` using `InMemoryUserDetailsManager` with BCrypt password hashing. They are for lab/demo purposes only.

---

## 4. How Login Works (HTTP Basic Authentication)

```
                           ┌─────────────────┐
   User enters             │   login.html    │
   username + password ──► │   auth.js       │
                           │                 │
   auth.js encodes them    │  "Basic base64" │
   as Base64 ─────────────►│                 │
                           │  Sends GET to   │
   Server returns 200? ───►│  /students/paged│
                           │                 │
   YES: Store in           │  sessionStorage │
   sessionStorage ────────►│                 │
                           │  Redirect to    │
   Navigate ──────────────►│  index.html     │
                           └─────────────────┘
```

**Key Points:**
- Credentials are stored in `sessionStorage` (cleared when you close the tab)
- Every API call adds `Authorization: Basic <encoded>` header
- If the server returns 401, the user is automatically redirected to login
- Clicking **Sign Out** clears session and redirects to login page

---

## 5. Dashboard Features

After login, `index.html` loads the main ERP dashboard:

### KPI Cards (Top Row)
- **Total Students** – count from `GET /students`
- **Total Courses** – count from `GET /courses`
- **Active Branches** – unique branches from student records
- **Total Credits** – sum of all course credits

### Recently Added Students (Table)
- Shows the 5 most recently added students (sorted by ID descending)
- Uses `GET /students/paged?page=0&size=5&sortBy=id&direction=desc`

### Session Activity Log
- Tracks create/update/delete operations performed in the current browser session
- Stored in `sessionStorage` (resets when you close the tab)

---

## 6. Student Management

Navigate via sidebar → **Students** (or `#students` in URL)

### Features

| Action | How |
|--------|-----|
| **View All** | Students are loaded with pagination and sorting |
| **Add Student** | Click "Add Student" → fill form → Save |
| **Edit Student** | Click pencil icon → modify fields → Update |
| **Delete Student** | Click trash icon → confirm → deleted with all courses |
| **View Details** | Click eye icon → shows student info + enrolled courses |
| **Search** | Select search mode (Name Contains, Exact Name, Email, Branch) + enter query |
| **Sort** | Use Sort By dropdown (Name, Email, Branch, Semester, ID) + direction |
| **Pagination** | Use page size dropdown + Previous/Next buttons |

### API Endpoints Used

```
GET  /students/paged?page=0&size=5&sortBy=name&direction=asc
GET  /students/search/paged?keyword=&page=0&size=5
GET  /students/search/name?name=
GET  /students/search/email?email=
GET  /students/search/branch?branch=
GET  /students/{id}
POST /students
PUT  /students/{id}
DELETE /students/{id}
```

---

## 7. Course Management

Navigate via sidebar → **Courses** (or `#courses` in URL)

### Features

| Action | How |
|--------|-----|
| **View All** | All courses with associated student names |
| **Filter by Student** | Dropdown to show only one student's courses |
| **Quick Filter** | Type course name or code to filter locally |
| **Enroll Course** | Click "Enroll Course" → select student → fill course details → Save |
| **Edit Course** | Click pencil icon → modify name/code/credits → Update |
| **Delete Course** | Click trash icon → confirm → deleted |
| **View Details** | Click eye icon → shows course info + enrolled student |

### How Student–Course Relationship Works

- A course **always** belongs to one student (Many-to-One)
- When creating a course, you must select a student from the dropdown
- The backend uses `POST /courses/student/{studentId}` to link them
- When editing a course, only name/code/credits can be changed (student link is permanent)
- Deleting a student **also deletes** all their enrolled courses (cascade)

### Why "Enrolled Student" Column Works

The `Course` entity uses `@JsonBackReference` on the student field, so `GET /courses` does not include student data directly. The frontend solves this by:
1. Loading all students via `GET /students` (which includes their `courses` list)
2. Building a `courseId → student` mapping in memory
3. Displaying the student name from this map in the courses table

---

## 8. Error Handling

The frontend handles all common error scenarios:

| Error | What Happens |
|-------|-------------|
| **401 Unauthorized** | Session cleared, redirected to login page |
| **403 Forbidden** | Toast notification: "Access forbidden" |
| **404 Not Found** | Toast notification with the error message |
| **400 Bad Request** | Validation error shown above the form |
| **500 Server Error** | Toast notification with error details |
| **Network Error** | Toast: "Unable to connect to backend" |

---

## 9. Common Issues and Solutions

### Problem: Login page shows "Unable to reach backend"
**Solution:** Make sure Spring Boot is running on port 8081. Check the terminal for startup errors.

### Problem: Login fails with "Invalid username or password"
**Solution:** Use the correct credentials: `admin` / `campus123` or `student` / `learn456`.

### Problem: Dashboard shows "Unavailable" for all stats
**Solution:** Check that MySQL is running and the `studentdb` database exists. Check the Spring Boot console for database connection errors.

### Problem: Courses show "Enrolled Student: Unavailable"
**Solution:** This happens if the student was deleted but their courses still exist (shouldn't happen with cascade). Refresh the page or add students first.

### Problem: "Enroll Course" button does nothing
**Solution:** You need at least one student in the system before enrolling a course. Add a student first.

### Problem: Application won't start – foreign key error
**Solution:** Run in MySQL Workbench:
```sql
ALTER TABLE course MODIFY COLUMN student_id BIGINT NOT NULL;
```
This fixes a column type mismatch between `course.student_id` (INT) and `student.id` (BIGINT).

---

## 10. Running Tests

Tests use H2 in-memory database (no MySQL needed):

```cmd
mvn test
```

This runs `StudentApiTest.java` with:
- Student CRUD tests (create, read, update, delete)
- Validation failure tests (empty name, invalid email)
- Security tests (401 for unauthenticated access)
- Public endpoint test (`/hello` accessible without auth)

---

## 11. File Responsibilities Summary

| File | Responsibility |
|------|---------------|
| `auth.js` | Login, logout, session check, Basic Auth encoding |
| `api.js` | All `fetch()` calls, error handling, auth header injection |
| `app.js` | Navigation, dashboard data, activity log, toast/modal utilities |
| `students.js` | Student table, forms, search, pagination, detail view |
| `courses.js` | Course table, forms, student filter, enrollment |
| `style.css` | Full ERP theme – sidebar, topbar, cards, tables, login page |
| `index.html` | Main SPA shell – all views, modals, and toast container |
| `login.html` | Standalone login page with backend health check |

---

*CampusLedger – Enterprise Java Lab Project | Ranodeep Malik*
