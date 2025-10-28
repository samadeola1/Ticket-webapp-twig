// assets/js/auth.js
const USERS_KEY = "ticketapp_users";
const SESSION_KEY = "ticketapp_session";

/**
 * Gets the currently logged-in user from LocalStorage.
 * @returns { {name: string, email: string} | null }
 */
export function getUserSession() {
    try {
        const sessionString = localStorage.getItem(SESSION_KEY);
        if (!sessionString) return null;

        const session = JSON.parse(sessionString);
        if (session && session.email && session.name) {
            return session;
        }
        return null;
    } catch (e) {
        console.error("Failed to load user session:", e);
        return null;
    }
}

/**
 * Attempts to sign up a new user.
 * @returns { {success: boolean, error?: string} }
 */
export function signup(name, email, password) {
    try {
        const usersString = localStorage.getItem(USERS_KEY) || "[]";
        const users = JSON.parse(usersString);

        if (users.some((u) => u.email === email)) {
            return { success: false, error: "Email already exists" };
        }

        // NOTE: Storing plain password is insecure, but matches the original app.
        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Automatically login after signup
        // We pass the password to the login function
        return login(email, password);
    } catch (error) {
        console.error("Signup failed:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

/**
 * Attempts to log in a user.
 * @returns { {success: boolean, error?: string} }
 */
export function login(email, password) {
    try {
        const usersString = localStorage.getItem(USERS_KEY) || "[]";
        const users = JSON.parse(usersString);

        // This is a more secure login than the original, checking password.
        const currentUser = users.find((u) => u.email === email);

        if (!currentUser) {
            return { success: false, error: "Invalid email or password" };
        }

       
        if (currentUser.password !== password) {
            
            if (currentUser.password !== password) {
                return { success: false, error: "Invalid email or password" };
            }
        }

        const userData = { name: currentUser.name, email: currentUser.email };
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true };
    } catch (error) {
        console.error("Login failed:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

/**
 * Logs the user out.
 */
export function logout() {
    localStorage.removeItem(SESSION_KEY);
    // We'll reload the page to reset all state
    window.location.href = "/";
}
