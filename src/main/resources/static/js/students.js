/**
 * students.js – Student Management module for CampusLedger.
 * Integrates with StudentController (/students/**) and CourseController (/courses/student/{id}).
 */
(function (window) {
    "use strict";

    const state = {
        page: 0,
        size: 5,
        sortBy: "name",
        direction: "asc",
        searchMode: "name-contains",
        searchQuery: "",
        totalPages: 0,
        totalElements: 0
    };

    let formModalInstance = null;
    let detailModalInstance = null;
    let initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;

        formModalInstance = new bootstrap.Modal(document.getElementById("studentFormModal"));
        detailModalInstance = new bootstrap.Modal(document.getElementById("studentDetailModal"));

        document.getElementById("openAddStudentBtn").addEventListener("click", () => openAddModal());

        document.getElementById("studentSearchForm").addEventListener("submit", (e) => {
            e.preventDefault();
            state.searchMode = document.getElementById("studentSearchMode").value;
            state.searchQuery = document.getElementById("studentSearchInput").value.trim();
            state.page = 0;
            load();
        });

        document.getElementById("clearStudentSearchBtn").addEventListener("click", () => {
            document.getElementById("studentSearchInput").value = "";
            state.searchQuery = "";
            state.page = 0;
            load();
        });

        document.getElementById("studentSortBy").addEventListener("change", (e) => {
            state.sortBy = e.target.value;
            state.page = 0;
            load();
        });

        document.getElementById("studentSortDir").addEventListener("change", (e) => {
            state.direction = e.target.value;
            state.page = 0;
            load();
        });

        document.getElementById("studentPageSize").addEventListener("change", (e) => {
            state.size = Number(e.target.value) || 5;
            state.page = 0;
            load();
        });

        document.getElementById("studentForm").addEventListener("submit", handleSaveStudent);
    }

    async function load() {
        init();
        const tbody = document.getElementById("studentsTableBody");
        const paginationFooter = document.getElementById("studentsPaginationFooter");
        const sortControls = document.getElementById("studentSortControls");

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <span class="spinner-border spinner-border-sm me-2"></span>Loading students...
                </td>
            </tr>`;

        try {
            let students = [];
            let isPaged = false;

            if (!state.searchQuery) {
                isPaged = true;
                const pageData = await window.CampusApi.students.getPaged(
                    state.page,
                    state.size,
                    state.sortBy,
                    state.direction
                );
                students = pageData.content || [];
                state.totalPages = pageData.totalPages || 0;
                state.totalElements = pageData.totalElements || 0;
            } else if (state.searchMode === "name-contains") {
                isPaged = true;
                const pageData = await window.CampusApi.students.searchPaged(
                    state.searchQuery,
                    state.page,
                    state.size
                );
                students = pageData.content || [];
                state.totalPages = pageData.totalPages || 0;
                state.totalElements = pageData.totalElements || 0;
            } else if (state.searchMode === "name") {
                students = await window.CampusApi.students.searchByName(state.searchQuery);
            } else if (state.searchMode === "email") {
                try {
                    const single = await window.CampusApi.students.searchByEmail(state.searchQuery);
                    students = single ? [single] : [];
                } catch (err) {
                    if (err.status === 404) {
                        students = [];
                    } else {
                        throw err;
                    }
                }
            } else if (state.searchMode === "branch") {
                students = await window.CampusApi.students.searchByBranch(state.searchQuery);
            }

            // Sort controls only apply to /students/paged
            sortControls.classList.toggle("opacity-50", Boolean(state.searchQuery));
            document.getElementById("studentSortBy").disabled = Boolean(state.searchQuery);
            document.getElementById("studentSortDir").disabled = Boolean(state.searchQuery);
            document.getElementById("studentPageSize").disabled = Boolean(state.searchQuery) && state.searchMode !== "name-contains";

            renderTable(students);

            if (isPaged) {
                paginationFooter.classList.remove("d-none");
                renderPagination();
            } else {
                paginationFooter.classList.remove("d-none");
                document.getElementById("studentsPaginationInfo").textContent =
                    `Showing ${students.length} matching record${students.length === 1 ? "" : "s"}`;
                document.getElementById("studentsPaginationList").innerHTML = "";
            }
        } catch (err) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-danger">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        ${window.CampusApp.escapeHtml(err.message || "Failed to load students.")}
                    </td>
                </tr>`;
            window.CampusApp.showToast(err.message || "Failed to load students.", "danger");
        }
    }

    function renderTable(students) {
        const tbody = document.getElementById("studentsTableBody");
        const esc = window.CampusApp.escapeHtml;

        if (!students || students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="bi bi-people"></i>
                            <div class="fw-semibold text-dark mb-1">No students found</div>
                            <div class="small">${state.searchQuery ? "Try adjusting your search query or reset filters." : "Click \"Add Student\" to create the first student record."}</div>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = students.map((s) => {
            const courseCount = Array.isArray(s.courses) ? s.courses.length : 0;
            return `
                <tr>
                    <td class="text-muted fw-medium">#${esc(s.id)}</td>
                    <td class="fw-semibold">${esc(s.name)}</td>
                    <td><a href="mailto:${esc(s.email)}" class="text-decoration-none">${esc(s.email)}</a></td>
                    <td><span class="badge-branch">${esc(s.branch)}</span></td>
                    <td>Sem ${esc(s.semester)}</td>
                    <td>
                        <span class="badge text-bg-light border">
                            ${courseCount} course${courseCount === 1 ? "" : "s"}
                        </span>
                    </td>
                    <td class="text-end text-nowrap">
                        <button class="btn btn-outline-secondary btn-sm me-1" data-action="view" data-id="${esc(s.id)}" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm me-1" data-action="edit" data-id="${esc(s.id)}" title="Edit Student">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${esc(s.id)}" data-name="${esc(s.name)}" title="Delete Student">
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
                if (action === "delete") confirmDeleteStudent(id, btn.dataset.name);
            });
        });
    }

    function renderPagination() {
        const info = document.getElementById("studentsPaginationInfo");
        const list = document.getElementById("studentsPaginationList");

        if (state.totalElements === 0) {
            info.textContent = "Showing 0 of 0 records";
            list.innerHTML = "";
            return;
        }

        const start = state.page * state.size + 1;
        const end = Math.min((state.page + 1) * state.size, state.totalElements);
        info.textContent = `Showing ${start}–${end} of ${state.totalElements} students`;

        const items = [];
        items.push(`
            <li class="page-item ${state.page === 0 ? "disabled" : ""}">
                <button class="page-link" type="button" data-page="${state.page - 1}">Prev</button>
            </li>`);

        for (let p = 0; p < state.totalPages; p++) {
            items.push(`
                <li class="page-item ${p === state.page ? "active" : ""}">
                    <button class="page-link" type="button" data-page="${p}">${p + 1}</button>
                </li>`);
        }

        items.push(`
            <li class="page-item ${state.page >= state.totalPages - 1 ? "disabled" : ""}">
                <button class="page-link" type="button" data-page="${state.page + 1}">Next</button>
            </li>`);

        list.innerHTML = items.join("");
        list.querySelectorAll("button[data-page]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetPage = Number(btn.dataset.page);
                if (targetPage >= 0 && targetPage < state.totalPages && targetPage !== state.page) {
                    state.page = targetPage;
                    load();
                }
            });
        });
    }

    function resetFormValidation() {
        const form = document.getElementById("studentForm");
        form.classList.remove("was-validated");
        const errBox = document.getElementById("studentFormServerError");
        errBox.classList.add("d-none");
        errBox.textContent = "";
    }

    function openAddModal() {
        init();
        resetFormValidation();
        document.getElementById("studentFormModalTitle").textContent = "Add Student";
        document.getElementById("studentFormId").value = "";
        document.getElementById("studentName").value = "";
        document.getElementById("studentEmail").value = "";
        document.getElementById("studentBranch").value = "";
        document.getElementById("studentSemester").value = "1";
        document.getElementById("studentSaveBtnText").textContent = "Create Student";
        formModalInstance.show();
    }

    async function openEditModal(id) {
        init();
        resetFormValidation();
        try {
            const student = await window.CampusApi.students.getById(id);
            document.getElementById("studentFormModalTitle").textContent = `Edit Student #${student.id}`;
            document.getElementById("studentFormId").value = student.id;
            document.getElementById("studentName").value = student.name || "";
            document.getElementById("studentEmail").value = student.email || "";
            document.getElementById("studentBranch").value = student.branch || "";
            document.getElementById("studentSemester").value = student.semester || 1;
            document.getElementById("studentSaveBtnText").textContent = "Update Student";
            formModalInstance.show();
        } catch (err) {
            window.CampusApp.showToast(err.message || "Unable to load student details.", "danger");
        }
    }

    async function handleSaveStudent(e) {
        e.preventDefault();
        const form = e.target;
        const errBox = document.getElementById("studentFormServerError");
        errBox.classList.add("d-none");

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const id = document.getElementById("studentFormId").value;
        const payload = {
            name: document.getElementById("studentName").value.trim(),
            email: document.getElementById("studentEmail").value.trim(),
            branch: document.getElementById("studentBranch").value.trim(),
            semester: Number(document.getElementById("studentSemester").value)
        };

        const saveBtn = document.getElementById("studentSaveBtn");
        const spinner = document.getElementById("studentSaveBtnSpinner");
        saveBtn.disabled = true;
        spinner.classList.remove("d-none");

        try {
            if (id) {
                const updated = await window.CampusApi.students.update(id, payload);
                window.CampusApp.showToast(`Student "${updated.name}" updated successfully.`, "success");
                window.CampusApp.logActivity(`Updated student ${updated.name} (#${updated.id})`, "primary");
            } else {
                const created = await window.CampusApi.students.create(payload);
                window.CampusApp.showToast(`Student "${created.name}" created successfully.`, "success");
                window.CampusApp.logActivity(`Created student ${created.name} (#${created.id})`, "success");
            }
            formModalInstance.hide();
            await load();
            window.CampusApp.refreshDashboard();
        } catch (err) {
            errBox.textContent = err.message || "Failed to save student.";
            errBox.classList.remove("d-none");
        } finally {
            saveBtn.disabled = false;
            spinner.classList.add("d-none");
        }
    }

    async function openViewModal(id) {
        init();
        const body = document.getElementById("studentDetailBody");
        const esc = window.CampusApp.escapeHtml;
        body.innerHTML = `
            <div class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Loading student details...
            </div>`;
        detailModalInstance.show();

        try {
            const [student, courses] = await Promise.all([
                window.CampusApi.students.getById(id),
                window.CampusApi.courses.getByStudent(id)
            ]);

            const coursesHtml = courses && courses.length > 0
                ? `<div class="table-responsive">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Code</th>
                                    <th>Course Name</th>
                                    <th>Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map((c) => `
                                    <tr>
                                        <td>#${esc(c.id)}</td>
                                        <td><span class="badge-code">${esc(c.courseCode)}</span></td>
                                        <td>${esc(c.courseName)}</td>
                                        <td>${esc(c.credits)}</td>
                                    </tr>`).join("")}
                            </tbody>
                        </table>
                   </div>`
                : `<div class="text-muted small py-2">No courses enrolled for this student yet.</div>`;

            body.innerHTML = `
                <div class="row g-3 mb-4">
                    <div class="col-sm-6">
                        <div class="small text-muted">Full Name</div>
                        <div class="fw-semibold fs-6">${esc(student.name)}</div>
                    </div>
                    <div class="col-sm-6">
                        <div class="small text-muted">Student ID</div>
                        <div class="fw-semibold">#${esc(student.id)}</div>
                    </div>
                    <div class="col-sm-6">
                        <div class="small text-muted">Email</div>
                        <div>${esc(student.email)}</div>
                    </div>
                    <div class="col-sm-3">
                        <div class="small text-muted">Branch</div>
                        <div><span class="badge-branch">${esc(student.branch)}</span></div>
                    </div>
                    <div class="col-sm-3">
                        <div class="small text-muted">Semester</div>
                        <div class="fw-medium">Semester ${esc(student.semester)}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="fw-semibold mb-0">Enrolled Courses (${courses.length})</h6>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="detailEnrollCourseBtn">
                        <i class="bi bi-journal-plus me-1"></i> Enroll Course
                    </button>
                </div>
                <div class="border rounded p-2 bg-light-subtle">
                    ${coursesHtml}
                </div>`;

            document.getElementById("detailEnrollCourseBtn").addEventListener("click", () => {
                detailModalInstance.hide();
                window.CampusCourses.openAddModal(student.id);
            });
        } catch (err) {
            body.innerHTML = `<div class="alert alert-danger mb-0">${esc(err.message || "Failed to load student details.")}</div>`;
        }
    }

    function confirmDeleteStudent(id, name) {
        window.CampusApp.openConfirmDelete(
            `Delete student "${name}" (#${id})? All courses enrolled under this student will also be removed.`,
            async () => {
                await window.CampusApi.students.remove(id);
                window.CampusApp.showToast(`Student "${name}" deleted.`, "success");
                window.CampusApp.logActivity(`Deleted student ${name} (#${id})`, "danger");
                await load();
                window.CampusApp.refreshDashboard();
            }
        );
    }

    window.CampusStudents = {
        load,
        openAddModal
    };
})(window);
