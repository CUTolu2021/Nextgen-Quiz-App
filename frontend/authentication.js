const maxInactiveTime = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

function isTokenExpired(token) {
    if (!token) return true; // No token means expired or not logged in

    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        return payload.exp * 1000 < Date.now(); // Check if expired
    } catch (e) {
        return true; // If decoding fails, consider token invalid
    }
}

function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        alert("Your session has expired. Please log in again.");
        localStorage.clear();
        window.location.href = "/signin"; // Redirect to login page
    }
}

// Run both checks on page load
checkAuth();