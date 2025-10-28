// assets/js/toast.js
export function showToast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");

    let bgColor = "bg-blue-600"; // info
    if (type === "success") bgColor = "bg-green-600";
    if (type === "error") bgColor = "bg-red-600";

    toast.className = `px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ease ${bgColor} opacity-0 translate-y-5 mb-2`;
    toast.textContent = message;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove("opacity-0", "translate-y-5");
        toast.classList.add("opacity-100", "translate-y-0");
    }, 10); // small delay to allow transition

    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove("opacity-100", "translate-y-0");
        toast.classList.add("opacity-0", "translate-y-5");
        setTimeout(() => {
            if (toast.parentElement === container) {
                container.removeChild(toast);
            }
        }, 300); // after transition
    }, duration);
}
