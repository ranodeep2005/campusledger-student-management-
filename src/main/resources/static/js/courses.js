/**
 * courses.js – Course Management module for CampusLedger.
 * Integrates with CourseController (/courses/**) and cross-references StudentController (/students)
 * to display associated student info (since Course.student uses @JsonBackReference).
 */
(function (window) {
    "use strict";

    let allCourses = [];
    let courseToStudentMap = new Map();
    let studentsList = [];
    let formModalInstance = null;
    let detailModalInstance = null;
    let initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;

        formModalInstance = new bootstrap.Modal(document.getElementById("courseFormModal"));
        detailModalInstance = new bootstrap.Modal(document.getElementById("courseDetailModal"));

        document.getElementById("openAddCourseBtn").addEventListener("click", () => openAddModal());

        document.getElementById("courseFilterStudent").addEventListener("change", () => {
            loadCoursesByFilter();
        });

        document.getElementById("courseQuickFilter").addEventListener("input", () => {
            renderFilteredCourses();
        });

        document.getElementById("resetCourseFilterBtn").addEventListener("click", () => {
            document.getElementById("courseFilterStudent").value = "";
            document.getElementById("courseQuickFilter").value = "";
            loadCoursesByFilter();
        });

        document.getElementById("courseForm").addEventListener("submit", handleSaveCourse);
    }

    async function load() {
        init();
        const tbody = document.getElementById("coursesTableBody");
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <span class="spinner-border spinner-border-sm me-2"></span>Loading courses...
                </td>
            </tr>`;

        try {
            const [students, courses] = await Promise.all([
                window.CampusApi.students.getAll(),
                window.CampusApi.courses.getAll()
            ]);

            studentsList = students || [];
            rebuildStudentCourseMap(studentsList);
            populateStudentFilterDropdown(studentsList);

            allCourses = courses || [];
            renderFilteredCourses();
        } catch (err) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5 text-danger">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        ${window.CampusApp.escapeHtml(err.message || "Failed to load courses.")}
                    </td>
                </tr>`;
            window.CampusApp.showToast(err.message || "Failed to load courses.", "danger");
        }
    }

    async function loadCoursesByFilter() {
        const studentId = document.getElementById("courseFilterStudent").value;
        const tbody = document.getElementById("coursesTableBody");
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <span class="spinner-border spinner-border-sm me-2"></span>Filtering courses...
                </td>
            </tr>`;

        try {
            allCourses = studentId
                ? await window.CampusApi.courses.getByStudent(studentId)
                : await window.CampusApi.courses.getAll();
            renderFilteredCourses();
        } catch (err) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5 text-danger">
                        ${window.CampusApp.escapeHtml(err.message || "Failed to filter courses.")}
                    </td>
                </tr>`;
        }
    }

    function rebuildStudentCourseMap(students) {
        courseToStudentMap = new Map();
        for (const student of students) {
            if (Array.isArray(student.courses)) {
                for (const course of student.courses) {
                    courseToStudentMap.set(course.id, student);
                }
            }
        }
    }

    function populateStudentFilterDropdown(students) {
        const select = document.getElementById("courseFilterStudent");
        const currentValue = select.value;
        const esc = window.CampusApp.escapeHtml;

        select.innerHTML = `<option value="">All Students (All Courses)</option>` +
            students.map((s) => `<option value="${esc(s.id)}">${esc(s.name)} (#${esc(s.id)} – ${esc(s.branch)})</option>`).join("");

        if (currentValue && students.some((s) => String(s.id) === currentValue)) {
            select.value = currentValue;
        }
    }

    function renderFilteredCourses() {
        const query = document.getElementById("courseQuickFilter").value.trim().toLowerCase();
        const filtered = query
            ? allCourses.filter((c) =>
                (c.courseName || "").toLowerCase().includes(query) ||
                (c.courseCode || "").toLowerCase().includes(query))
            : allCourses;

        renderTable(filtered);
    }

    function renderTable(courses) {
        const tbody = document.getElementById("coursesTableBody");
        const esc = window.CampusApp.escapeHtml;

        if (!courses || courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="bi bi-book"></i>
                            <div class="fw-semibold text-dark mb-1">No courses found</div>
                            <div class="small">Enroll a course under a student or adjust your active filters.</div>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = courses.map((c) => {
            const student = courseToStudentMap.get(c.id);
            const studentBadge = student
                ? `<span class="fw-medium">${esc(student.name)}</span> <span class="text-muted small">(#${esc(student.id)}, ${esc(student.branch)})</span>`
                : `<span class="text-muted small">Unavailable</span>`;

            return `
                <tr>
                    <td class="text-muted fw-medium">#${esc(c.id)}</td>
                    <td><span class="badge-code">${esc(c.courseCode)}</span></td>
                    <td class="fw-semibold">${esc(c.courseName)}</td>
                    <td>${esc(c.credits)} credit${c.credits === 1 ? "" : "s"}</td>
                    <td>${studentBadge}</td>
                    <td class="text-end text-nowrap">
                        <button class="btn btn-outline-secondary btn-sm me-1" data-action="view" data-id="${esc(c.id)}" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm me-1" data-action="edit" data-id="${esc(c.id)}" title="Edit Course">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${esc(c.id)}" data-name="${esc(c.courseName)}" title="Delete Course">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join("");

        tbody.querySelectorAll("button[data-action]").forEach((btn) => {
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            btn.addEventListener("click", () => {
                if (action === "view") openViewModal(id);
                if (action === "edit") openEditModal(id);
                if (action === "delete") confirmDeleteCourse(id, btn.dataset.name);
            });
        });
    }

    function resetFormValidation() {
        const form = document.getElementById("courseForm");
        form.classList.remove("was-validated");
        const errBox = document.getElementById("courseFormServerError");
        errBox.classList.add("d-none");
        errBox.textContent = "";
    }

    async function openAddModal(preselectedStudentId = null) {
        init();
        resetFormValidation();

        try {
            studentsList = await window.CampusApi.students.getAll();
        } catch (err) {
            window.CampusApp.showToast("Unable to load students list for course enrollment.", "danger");
            return;
        }

        if (studentsList.length === 0) {
            window.CampusApp.showToast("Please create a student first before enrolling a course.", "warning");
            return;
        }

        const esc = window.CampusApp.escapeHtml;
        const select = document.getElementById("courseStudentId");
        select.innerHTML = `<option value="">Select a student...</option>` +
            studentsList.map((s) => `<option value="${esc(s.id)}">${esc(s.name)} (#${esc(s.id)} – ${esc(s.branch)})</option>`).join("");

        if (preselectedStudentId) {
            select.value = String(preselectedStudentId);
        }

        document.getElementById("courseStudentSelectGroup").classList.remove("d-none");
        select.required = true;

        document.getElementById("courseFormModalTitle").textContent = "Enroll Course";
        document.getElementById("courseFormId").value = "";
        document.getElementById("courseName").value = "";
        document.getElementById("courseCode").value = "";
        document.getElementById("courseCredits").value = "3";
        document.getElementById("courseSaveBtnText").textContent = "Enroll Course";
        formModalInstance.show();
    }

    async function openEditModal(id) {
        init();
        resetFormValidation();
        try {
            const course = await window.CampusApi.courses.getById(id);
            document.getElementById("courseFormModalTitle").textContent = `Edit Course #${course.id}`;
            document.getElementById("courseFormId").value = course.id;
            document.getElementById("courseName").value = course.courseName || "";
            document.getElementById("courseCode").value = course.courseCode || "";
            document.getElementById("courseCredits").value = course.credits || 3;

            // PUT /courses/{id} updates course fields only; student association is immutable in CourseController
            document.getElementById("courseStudentSelectGroup").classList.add("d-none");
            document.getElementById("courseStudentId").required = false;

            document.getElementById("courseSaveBtnText").textContent = "Update Course";
            formModalInstance.show();
        } catch (err) {
            window.CampusApp.showToast(err.message || "Unable to load course details.", "danger");
        }
    }

    async function handleSaveCourse(e) {
        e.preventDefault();
        const form = e.target;
        const errBox = document.getElementById("courseFormServerError");
        errBox.classList.add("d-none");

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const id = document.getElementById("courseFormId").value;
        const payload = {
            courseName: document.getElementById("courseName").value.trim(),
            courseCode: document.getElementById("courseCode").value.trim(),
            credits: Number(document.getElementById("courseCredits").value)
        };

        const saveBtn = document.getElementById("courseSaveBtn");
        const spinner = document.getElementById("courseSaveBtnSpinner");
        saveBtn.disabled = true;
        spinner.classList.remove("d-none");

        try {
            if (id) {
                const updated = await window.CampusApi.courses.update(id, payload);
                window.CampusApp.showToast(`Course "${updated.courseName}" updated.`, "success");
                window.CampusApp.logActivity(`Updated course ${updated.courseCode} – ${updated.courseName}`, "primary");
            } else {
                const studentId = document.getElementById("courseStudentId").value;
                const created = await window.CampusApi.courses.addToStudent(studentId, payload);
                window.CampusApp.showToast(`Course "${created.courseName}" enrolled.`, "success");
                window.CampusApp.logActivity(`Enrolled ${created.courseCode} under student #${studentId}`, "success");
            }
            formModalInstance.hide();
            await load();
            window.CampusApp.refreshDashboard();
        } catch (err) {
            errBox.textContent = err.message || "Failed to save course.";
            errBox.classList.remove("d-none");
        } finally {
            saveBtn.disabled = false;
            spinner.classList.add("d-none");
        }
    }

    async function openViewModal(id) {
        init();
        const body = document.getElementById("courseDetailBody");
        const esc = window.CampusApp.escapeHtml;
        body.innerHTML = `
            <div class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Loading course details...
            </div>`;
        detailModalInstance.show();

        try {
            const course = await window.CampusApi.courses.getById(id);
            const student = courseToStudentMap.get(course.id);

            body.innerHTML = `
                <div class="row g-3">
                    <div class="col-sm-6">
                        <div class="small text-muted">Course ID</div>
                        <div class="fw-semibold">#${esc(course.id)}</div>
                    </div>
                    <div class="col-sm-6">
                        <div class="small text-muted">Course Code</div>
                        <div><span class="badge-code">${esc(course.courseCode)}</span></div>
                    </div>
                    <div class="col-12">
                        <div class="small text-muted">Course Name</div>
                        <div class="fw-semibold fs-6">${esc(course.courseName)}</div>
                    </div>
                    <div class="col-sm-6">
                        <div class="small text-muted">Credits</div>
                        <div class="fw-medium">${esc(course.credits)}</div>
                    </div>
                    <div class="col-sm-6">
                        <div class="small text-muted">Enrolled Student</div>
                        <div>${student ? `${esc(student.name)} (#${esc(student.id)}, ${esc(student.branch)})` : "Unavailable"}</div>
                    </div>
                </div>`;
        } catch (err) {
            body.innerHTML = `<div class="alert alert-danger mb-0">${esc(err.message || "Failed to load course details.")}</div>`;
        }
    }

    function confirmDeleteCourse(id, name) {
        window.CampusApp.openConfirmDelete(
            `Delete course "${name}" (#${id})?`,
            async () => {
                await window.CampusApi.courses.remove(id);
                window.CampusApp.showToast(`Course "${name}" deleted.`, "success");
                window.CampusApp.logActivity(`Deleted course ${name} (#${id})`, "danger");
                await load();
                window.CampusApp.refreshDashboard();
            }
        );
    }

    window.CampusCourses = {
        load,
        openAddModal
    };
})(window);
