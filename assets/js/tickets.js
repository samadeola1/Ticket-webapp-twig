// assets/js/tickets.js
import { getUserSession } from "./auth.js";

function getStorageKey() {
    const user = getUserSession();
    return user ? `tickets_${user.email}` : null;
}

function saveTickets(tickets) {
    const key = getStorageKey();
    if (key) {
        try {
            localStorage.setItem(key, JSON.stringify(tickets));
        } catch (error) {
            console.error("Failed to save tickets:", error);
        }
    }
}

/**
 * @returns {Array<Object>}
 */
export function getTickets() {
    const key = getStorageKey();
    if (!key) return [];
    try {
        const storedTicketsString = localStorage.getItem(key) || "[]";
        return JSON.parse(storedTicketsString);
    } catch (error) {
        console.error("Failed to load tickets:", error);
        return [];
    }
}

/**
 * @param { {title: string, description: string, status: string} } ticketData
 */
export function createTicket(ticketData) {
    const newTicket = {
        ...ticketData,
        id: Date.now(), // Generate ID
        createdAt: new Date().toISOString(),
    };
    const tickets = getTickets();
    const updated = [...tickets, newTicket];
    saveTickets(updated);
}

/**
 * @param { {id: number, title: string, description: string, status: string} } updatedTicket
 */
export function updateTicket(updatedTicket) {
    let tickets = getTickets();
    const index = tickets.findIndex((t) => t.id === updatedTicket.id);
    if (index !== -1) {
        tickets[index] = { ...updatedTicket }; // Ensure immutability
        saveTickets(tickets);
    }
}

/**
 * @param {number} id
 */
export function deleteTicket(id) {
    let tickets = getTickets();
    const updated = tickets.filter((t) => t.id !== id);
    saveTickets(updated);
}
