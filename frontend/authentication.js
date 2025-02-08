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
        window.location.href = "signin.html"; // Redirect to login page
    }
}


function updateLastActiveTime() {
    localStorage.setItem("lastActive", Date.now());
}

function checkInactivity() {
    const lastActive = localStorage.getItem("lastActive");

    if (!lastActive || Date.now() - lastActive > maxInactiveTime) {
        alert("You have been logged out due to inactivity.");
        localStorage.clear();
        window.location.href = "login.html";
    } else {
        updateLastActiveTime(); // Update last active time on every check
    }
}

// Track user activity
document.addEventListener("mousemove", updateLastActiveTime);
document.addEventListener("keydown", updateLastActiveTime);

// Run both checks on page load
checkAuth();
checkInactivity();
