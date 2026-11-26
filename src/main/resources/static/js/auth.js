/**
 * auth.js – HTTP Basic Authentication helper for CampusLedger.
 *
 * Integrates with Spring Security's httpBasic() configuration in SecurityConfig.java.
 * Credentials are encoded as Base64 for the current browser session only (sessionStorage).
 */
(function (window) {
    "use strict";

    const AUTH_HEADER_KEY = "cl_auth_header";
    const USERNAME_KEY = "cl_username";

    function encodeBasicAuth(username, password) {
        // Encode UTF-8 string safely to Base64
        const bytes = new TextEncoder().encode(`${username}:${password}`);
        let binary = "";
        for (const b of bytes) {
            binary += String.fromCharCode(b);
        }
        return "Basic " + btoa(binary);
    }

    function getAuthHeader() {
        return sessionStorage.getItem(AUTH_HEADER_KEY) || "";
    }

    function getUsername() {
        return sessionStorage.getItem(USERNAME_KEY) || "";
    }

    function isAuthenticated() {
        return Boolean(getAuthHeader());
    }

    function clearSession() {
        sessionStorage.removeItem(AUTH_HEADER_KEY);
        sessionStorage.removeItem(USERNAME_KEY);
    }

    /**
     * Validates credentials against a protected Spring Boot endpoint (/students/paged).
     * Stores the Basic Auth header in sessionStorage only if the server accepts it.
     */
    async function login(username, password) {
        const header = encodeBasicAuth(username, password);

        let response;
        try {
            response = await fetch("/students/paged?page=0&size=1", {
                method: "GET",
                headers: {
                    "Authorization": header,
                    "Accept": "application/json"
                }
            });
        } catch (networkErr) {
            throw new Error("Unable to reach the CampusLedger server. Please verify the backend is running.");
        }

        if (response.status === 401) {
            throw new Error("Invalid username or password (HTTP 401 Unauthorized).");
        }
        if (response.status === 403) {
            throw new Error("Access denied for this account (HTTP 403 Forbidden).");
        }
        if (!response.ok) {
            throw new Error(`Authentication check failed with HTTP ${response.status}.`);
        }

        sessionStorage.setItem(AUTH_HEADER_KEY, header);
        sessionStorage.setItem(USERNAME_KEY, username);
        return { username };
    }

    function logout() {
        clearSession();
        window.location.href = "/login.html";
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = "/login.html";
            return false;
        }
        return true;
    }

    window.CampusAuth = {
        getAuthHeader,
        getUsername,
        isAuthenticated,
        clearSession,
        login,
        logout,
        requireAuth
    };
})(window);
