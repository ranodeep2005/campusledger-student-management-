/**
 * app.js – Main application shell, navigation, dashboard, and UI utilities for CampusLedger.
 */
(function (window) {
    "use strict";

    const ACTIVITY_STORAGE_KEY = "cl_session_activity";
    let confirmModalInstance = null;
    let pendingDeleteCallback = null;

    document.addEventListener("DOMContentLoaded", () => {
        if (!window.CampusAuth.requireAuth()) return;

        confirmModalInstance = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
        document.getElementById("confirmDeleteActionBtn").addEventListener("click", async () => {
            if (!pendingDeleteCallback) return;
            const btn = document.getElementById("confirmDeleteActionBtn");
            btn.disabled = true;
            try {
                await pendingDeleteCallback();
                confirmModalInstance.hide();
            } catch (err) {
                showToast(err.message || "Delete operation failed.", "danger");
            } finally {
                btn.disabled = false;
                pendingDeleteCallback = null;
            }
        });

        setupShellEvents();
        renderUserAndHealth();
        renderActivityLog();

        const initialView = getViewFromHash();
        navigateTo(initialView);
    });

    function setupShellEvents() {
        const sidebar = document.getElementById("sidebar");
        const backdrop = document.getElementById("sidebarBackdrop");
        const toggleBtn = document.getElementById("sidebarToggleBtn");

        const closeSidebar = () => {
            sidebar.classList.remove("open");
            backdrop.classList.remove("show");
        };

        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            backdrop.classList.toggle("show");
        });
        backdrop.addEventListener("click", closeSidebar);

        document.querySelectorAll(".sidebar-link[data-view]").forEach((link) => {
            link.addEventListener("click", () => {
                navigateTo(link.dataset.view);
                closeSidebar();
            });
        });

        document.getElementById("logoutBtn").addEventListener("click", () => {
            window.CampusAuth.logout();
        });

        document.getElementById("quickAddStudentBtn").addEventListener("click", () => {
            navigateTo("students");
            window.CampusStudents.openAddModal();
        });

        document.getElementById("quickAddCourseBtn").addEventListener("click", () => {
            navigateTo("courses");
            window.CampusCourses.openAddModal();
        });

        document.getElementById("refreshDashboardBtn").addEventListener("click", () => {
            refreshDashboard();
        });

        document.getElementById("viewAllStudentsLink").addEventListener("click", () => {
            navigateTo("students");
        });

        window.addEventListener("hashchange", () => {
            navigateTo(getViewFromHash());
        });
    }

    function getViewFromHash() {
        const hash = (window.location.hash || "").replace("#", "").toLowerCase();
        if (hash === "students" || hash === "courses" || hash === "dashboard") {
            return hash;
        }
        return "dashboard";
    }

    function navigateTo(view) {
        const titles = {
            dashboard: "Dashboard",
            students: "Student Management",
            courses: "Course Management"
        };

        const targetView = titles[view] ? view : "dashboard";
        if (window.location.hash !== `#${targetView}`) {
            window.location.hash = targetView;
        }

        document.getElementById("topbarPageTitle").textContent = titles[targetView];

        document.querySelectorAll(".sidebar-link[data-view]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.view === targetView);
        });

        document.querySelectorAll(".app-view").forEach((section) => {
            section.classList.toggle("d-none", section.id !== `view-${targetView}`);
        });

        if (targetView === "dashboard") {
            refreshDashboard();
        } else if (targetView === "students") {
            window.CampusStudents.load();
        } else if (targetView === "courses") {
            window.CampusCourses.load();
        }
    }

    async function renderUserAndHealth() {
        const username = window.CampusAuth.getUsername() || "Authenticated User";
        document.getElementById("currentUsernameLabel").textContent = username;

        const statusBadge = document.getElementById("sidebarApiStatus");
        try {
            await window.CampusApi.hello();
            statusBadge.className = "badge bg-success";
            statusBadge.textContent = "Online";
        } catch (err) {
            statusBadge.className = "badge bg-danger";
            statusBadge.textContent = "Offline";
        }
    }

    async function refreshDashboard() {
        const totalStudentsEl = document.getElementById("kpiTotalStudents");
        const totalCoursesEl = document.getElementById("kpiTotalCourses");
        const activeBranchesEl = document.getElementById("kpiActiveBranches");
        const totalCreditsEl = document.getElementById("kpiTotalCredits");
        const recentBody = document.getElementById("recentStudentsTableBody");

        try {
            const [students, courses, recentPaged] = await Promise.all([
                window.CampusApi.students.getAll(),
                window.CampusApi.courses.getAll(),
                window.CampusApi.students.getPaged(0, 5, "id", "desc")
            ]);

            totalStudentsEl.textContent = String(students.length);
            document.getElementById("kpiStudentsSub").textContent = "Registered in database";

            totalCoursesEl.textContent = String(courses.length);
            document.getElementById("kpiCoursesSub").textContent = "Active enrollments";

            const branches = new Set(students.map((s) => (s.branch || "").trim()).filter(Boolean));
            activeBranchesEl.textContent = String(branches.size);
            document.getElementById("kpiBranchesSub").textContent = branches.size > 0
                ? Array.from(branches).slice(0, 4).join(", ")
                : "No branches recorded";

            const creditsSum = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
            totalCreditsEl.textContent = String(creditsSum);

            const recentStudents = recentPaged.content || [];
            if (recentStudents.length === 0) {
                recentBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                            No students registered yet.
                        </td>
                    </tr>`;
            } else {
                recentBody.innerHTML = recentStudents.map((s) => {
                    const count = Array.isArray(s.courses) ? s.courses.length : 0;
                    return `
                        <tr>
                            <td class="text-muted">#${escapeHtml(s.id)}</td>
                            <td class="fw-semibold">${escapeHtml(s.name)}</td>
                            <td><span class="badge-branch">${escapeHtml(s.branch)}</span></td>
                            <td>Sem ${escapeHtml(s.semester)}</td>
                            <td>${count}</td>
                        </tr>`;
                }).join("");
            }
        } catch (err) {
            totalStudentsEl.textContent = "Unavailable";
            totalCoursesEl.textContent = "Unavailable";
            activeBranchesEl.textContent = "Unavailable";
            totalCreditsEl.textContent = "Unavailable";
            document.getElementById("kpiStudentsSub").textContent = "API error";
            document.getElementById("kpiCoursesSub").textContent = "API error";
            recentBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-danger">
                        ${escapeHtml(err.message || "Unable to load dashboard data.")}
                    </td>
                </tr>`;
        }
    }

    function logActivity(description, tone = "primary") {
        let items = [];
        try {
            items = JSON.parse(sessionStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]");
        } catch {
            items = [];
        }

        items.unshift({
            description,
            tone,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        });
        items = items.slice(0, 8);
        sessionStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(items));
        renderActivityLog();
    }

    function renderActivityLog() {
        const list = document.getElementById("recentActivityList");
        let items = [];
        try {
            items = JSON.parse(sessionStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]");
        } catch {
            items = [];
        }

        if (items.length === 0) {
            list.innerHTML = `<li class="text-muted small">No mutations performed in this session yet.</li>`;
            return;
        }

        const colorMap = {
            success: "bg-success",
            danger: "bg-danger",
            primary: "bg-primary",
            warning: "bg-warning"
        };

        list.innerHTML = items.map((item) => `
            <li class="activity-item">
                <span class="activity-dot ${colorMap[item.tone] || "bg-primary"}"></span>
                <div class="flex-grow-1">
                    <div class="small fw-medium">${escapeHtml(item.description)}</div>
                    <div class="text-muted" style="font-size: 0.74rem;">${escapeHtml(item.time)}</div>
                </div>
            </li>`).join("");
    }

    function openConfirmDelete(message, onConfirm) {
        document.getElementById("confirmDeleteMessage").textContent = message;
        pendingDeleteCallback = onConfirm;
        confirmModalInstance.show();
    }

    function showToast(message, variant = "primary") {
        const container = document.getElementById("toastContainer");
        const toastEl = document.createElement("div");
        toastEl.className = `toast align-items-center text-bg-${variant} border-0`;
        toastEl.setAttribute("role", "alert");
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(message)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>`;
        container.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
        toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
        toast.show();
    }

    function escapeHtml(val) {
        if (val === null || val === undefined) return "";
        return String(val)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    window.CampusApp = {
        showToast,
        logActivity,
        navigateTo,
        refreshDashboard,
        openConfirmDelete,
        escapeHtml
    };
})(window);
