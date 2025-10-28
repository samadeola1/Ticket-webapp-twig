// assets/app.js
import './styles/app.css'; // <--- MAKE SURE THIS LINE EXISTS
import "./bootstrap.js";


import { getUserSession, logout } from "./js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const user = getUserSession();

    // Get all Navbar elements
    const navUserLinks = document.getElementById("nav-user-links");
    const navGuestLinks = document.getElementById("nav-guest-links");
    const navUserName = document.getElementById("nav-user-name");
    const navLogoutBtn = document.getElementById("nav-logout-btn");

    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileNavUserLinks = document.getElementById("mobile-nav-user-links");
    const mobileNavGuestLinks = document.getElementById(
        "mobile-nav-guest-links"
    );
    const mobileNavUserName = document.getElementById("mobile-nav-user-name");
    const mobileNavLogoutBtn = document.getElementById("mobile-nav-logout-btn");
    const mobileMenuIcon = mobileMenuBtn.querySelector("i");

    // --- Auth State Logic ---
    if (user) {
        // Desktop
        navUserLinks.classList.remove("hidden");
        navUserLinks.classList.add("flex");
        navGuestLinks.classList.add("hidden");
        navGuestLinks.classList.remove("flex");
        navUserName.textContent = `👋 Hi, ${user.name}`;

        // Mobile
        mobileNavUserLinks.classList.remove("hidden");
        mobileNavGuestLinks.classList.add("hidden");
        mobileNavUserName.textContent = `👋 Hi, ${user.name}`;
    } else {
        // Desktop
        navUserLinks.classList.add("hidden");
        navUserLinks.classList.remove("flex");
        navGuestLinks.classList.remove("hidden");
        navGuestLinks.classList.add("flex");

        // Mobile
        mobileNavUserLinks.classList.add("hidden");
        mobileNavGuestLinks.classList.remove("hidden");
    }

    // --- Event Listeners ---
    function handleLogout() {
        logout();
    }

    navLogoutBtn.addEventListener("click", handleLogout);
    mobileNavLogoutBtn.addEventListener("click", handleLogout);

    // Mobile menu toggle
    mobileMenuBtn.addEventListener("click", () => {
        const isOpen = !mobileMenu.classList.contains("hidden");
        if (isOpen) {
            mobileMenu.classList.add("hidden");
            mobileMenuIcon.setAttribute("data-lucide", "menu");
        } else {
            mobileMenu.classList.remove("hidden");
            mobileMenuIcon.setAttribute("data-lucide", "x");
        }
        lucide.createIcons(); // Re-render the icon
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            mobileMenuIcon.setAttribute("data-lucide", "menu");
            lucide.createIcons();
        });
    });

    // --- Landing Page Specific Logic ---
    if (window.location.pathname === "/") {
        // Update CTA button
        if (user) {
            document.getElementById(
                "landing-subtitle"
            ).textContent = `Welcome back, ${user.name}!`;
            const ctaBtn = document.getElementById("landing-cta-btn");
            ctaBtn.textContent = "Go to My Tickets";
            ctaBtn.href = "/tickets";
            // Add back the icon
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "arrow-right");
            icon.className =
                "w-5 h-5 ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1";
            ctaBtn.appendChild(icon);
            lucide.createIcons();
        }

        // Intersection Observer for features
        const featureCards = document.querySelectorAll(".feature-card");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(
                            "opacity-100",
                            "translate-y-0"
                        );
                        entry.target.classList.remove(
                            "opacity-0",
                            "translate-y-6"
                        );
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        featureCards.forEach((card) => observer.observe(card));
    }

    // --- Dashboard Page Specific Logic ---
    if (window.location.pathname === "/dashboard") {
        import("./js/tickets.js").then(({ getTickets }) => {
            if (!user) return; // Protected route check
            document.getElementById("dashboard-user-name").textContent =
                user.name;

            const tickets = getTickets();
            document.getElementById("stat-total").textContent = tickets.length;
            document.getElementById("stat-open").textContent = tickets.filter(
                (t) => t.status === "open"
            ).length;
            document.getElementById("stat-progress").textContent =
                tickets.filter((t) => t.status === "in_progress").length;
            document.getElementById("stat-closed").textContent = tickets.filter(
                (t) => t.status === "closed"
            ).length;
        });
    }
});
