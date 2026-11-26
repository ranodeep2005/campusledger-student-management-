/**
 * api.js – Centralized Fetch API client for CampusLedger REST endpoints.
 *
 * Uses same-origin requests matching:
 *   - HelloController   (/hello)
 *   - StudentController (/students/**)
 *   - CourseController  (/courses/**)
 */
(function (window) {
    "use strict";

    class ApiError extends Error {
        constructor(status, message, details = null) {
            super(message);
            this.name = "ApiError";
            this.status = status;
            this.details = details;
        }
    }

    async function request(url, options = {}) {
        const {
            method = "GET",
            body = null,
            requiresAuth = true
        } = options;

        const headers = {
            "Accept": "application/json"
        };

        if (body !== null) {
            headers["Content-Type"] = "application/json";
        }

        if (requiresAuth) {
            const authHeader = window.CampusAuth.getAuthHeader();
            if (authHeader) {
                headers["Authorization"] = authHeader;
            }
        }

        let response;
        try {
            response = await fetch(url, {
                method,
                headers,
                body: body !== null ? JSON.stringify(body) : undefined
            });
        } catch (networkErr) {
            throw new ApiError(0, "Network error: unable to connect to CampusLedger backend.");
        }

        // Handle 401 / 403
        if (response.status === 401) {
            window.CampusAuth.clearSession();
            if (!window.location.pathname.endsWith("/login.html")) {
                window.location.href = "/login.html";
            }
            throw new ApiError(401, "Session expired or unauthorized. Please sign in again.");
        }

        if (response.status === 403) {
            throw new ApiError(403, "Access forbidden: you do not have permission for this action.");
        }

        // Handle 204 No Content (e.g., DELETE /students/{id}, DELETE /courses/{id})
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

        if (!response.ok) {
            let message = `Request failed (HTTP ${response.status})`;
            if (payload && typeof payload === "object") {
                if (payload.error && payload.message) {
                    message = `${payload.error}: ${payload.message}`;
                } else if (payload.message) {
                    message = payload.message;
                } else if (payload.error) {
                    message = payload.error;
                }
            } else if (typeof payload === "string" && payload.trim()) {
                message = payload.trim();
            }
            throw new ApiError(response.status, message, payload);
        }

        return payload;
    }

    const CampusApi = {
        ApiError,

        // HelloController
        hello() {
            return request("/hello", { method: "GET", requiresAuth: false });
        },

        // StudentController
        students: {
            getAll() {
                return request("/students");
            },
            getById(id) {
                return request(`/students/${encodeURIComponent(id)}`);
            },
            create(studentData) {
                return request("/students", { method: "POST", body: studentData });
            },
            update(id, studentData) {
                return request(`/students/${encodeURIComponent(id)}`, { method: "PUT", body: studentData });
            },
            remove(id) {
                return request(`/students/${encodeURIComponent(id)}`, { method: "DELETE" });
            },
            searchByName(name) {
                return request(`/students/search/name?name=${encodeURIComponent(name)}`);
            },
            searchByNameContains(keyword) {
                return request(`/students/search/name-contains?keyword=${encodeURIComponent(keyword)}`);
            },
            searchByEmail(email) {
                return request(`/students/search/email?email=${encodeURIComponent(email)}`);
            },
            searchByBranch(branch) {
                return request(`/students/search/branch?branch=${encodeURIComponent(branch)}`);
            },
            getPaged(page = 0, size = 5, sortBy = "name", direction = "asc") {
                const params = new URLSearchParams({
                    page: String(page),
                    size: String(size),
                    sortBy,
                    direction
                });
                return request(`/students/paged?${params.toString()}`);
            },
            searchPaged(keyword, page = 0, size = 5) {
                const params = new URLSearchParams({
                    keyword,
                    page: String(page),
                    size: String(size)
                });
                return request(`/students/search/paged?${params.toString()}`);
            }
        },

        // CourseController
        courses: {
            getAll() {
                return request("/courses");
            },
            getById(id) {
                return request(`/courses/${encodeURIComponent(id)}`);
            },
            addToStudent(studentId, courseData) {
                return request(`/courses/student/${encodeURIComponent(studentId)}`, {
                    method: "POST",
                    body: courseData
                });
            },
            update(id, courseData) {
                return request(`/courses/${encodeURIComponent(id)}`, {
                    method: "PUT",
                    body: courseData
                });
            },
            remove(id) {
                return request(`/courses/${encodeURIComponent(id)}`, {
                    method: "DELETE"
                });
            },
            getByStudent(studentId) {
                return request(`/courses/student/${encodeURIComponent(studentId)}`);
            }
        }
    };

    window.CampusApi = CampusApi;
})(window);
