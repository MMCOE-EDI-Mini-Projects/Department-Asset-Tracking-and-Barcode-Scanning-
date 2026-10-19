/**
 * Department Asset Tracking and Barcode Scanning System
 * Unified Client Core Module (Vanilla JavaScript - Light Mode & Clean Navbar)
 */

const API_BASE = "";

// Authentication & Session State
const Auth = {
    getToken() {
        return localStorage.getItem("token") || "";
    },
    getUser() {
        const u = localStorage.getItem("user");
        try {
            return u ? JSON.parse(u) : null;
        } catch {
            return null;
        }
    },
    setUser(user, token) {
        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    },
    requireAuth() {
        const user = this.getUser();
        if (!user && !window.location.pathname.endsWith("login.html")) {
            window.location.href = "login.html";
        }
        return user;
    },
    isPrivileged() {
        const u = this.getUser();
        return u && (u.role === "asset_admin" || u.role === "dept_head");
    },
    requirePrivileged() {
        const user = this.requireAuth();
        if (user && user.role === "staff") {
            showToast("Access Denied: Transfer, Maintenance, Audit, and Disposal are restricted to Admin and Dept Head.", "error");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 600);
            return false;
        }
        return true;
    },
    hasPermission(key) {
        const u = this.getUser();
        if (!u) return false;
        if (u.role === "asset_admin") return true;
        try {
            const perms = typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions;
            return perms && (perms[key] === true || perms["all"] === true);
        } catch {
            return false;
        }
    }
};

// Unified API Client
const API = {
    async request(endpoint, options = {}) {
        const token = Auth.getToken();
        const headers = {
            ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { "Authorization": "Bearer " + token } : {}),
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        try {
            const res = await fetch(API_BASE + endpoint, config);
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 401 && !window.location.pathname.endsWith("login.html")) {
                    Auth.logout();
                }
                throw new Error(data.error || "Request failed with status " + res.status);
            }
            return data;
        } catch (err) {
            console.error("API Error (" + endpoint + "):", err);
            throw err;
        }
    },
    get(endpoint) {
        return this.request(endpoint, { method: "GET" });
    },
    post(endpoint, body) {
        return this.request(endpoint, {
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },
    put(endpoint, body) {
        return this.request(endpoint, {
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },
    delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    }
};

// Toast Notifications (No emojis)
function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "all 0.25s ease";
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

// Formatters
function formatCurrency(val) {
    if (val === null || val === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
}

function formatDate(val) {
    if (!val) return "—";
    try {
        const d = new Date(val);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return val;
    }
}

// Navigation Bar Renderer (Uncluttered Profile Icon, mmcoe.jpg Logo, Clean SVGs)
function renderNavbar(activePage) {
    const navEl = document.getElementById("mainNavbar");
    if (!navEl) return;

    const user = Auth.getUser() || { name: "Guest User", role: "staff" };
    const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";
    const roleTitle = user.role ? user.role.replace('_', ' ').toUpperCase() : "STAFF";

    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            href: "index.html",
            svg: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`
        },
        {
            id: "register",
            label: "Receive",
            href: "register.html",
            svg: `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
        },
        {
            id: "assets",
            label: "Assets",
            href: "assets.html",
            svg: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`
        },
        {
            id: "scanner",
            label: "Scanner",
            href: "scanner.html",
            svg: `<svg viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="7" y1="12" x2="17" y2="12"></line></svg>`
        },
        {
            id: "transfer",
            label: "Transfer",
            href: "transfer.html",
            svg: `<svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`
        },
        {
            id: "maintenance",
            label: "Maintenance",
            href: "maintenance.html",
            svg: `<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
        },
        {
            id: "audit",
            label: "Audit",
            href: "audit.html",
            svg: `<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`
        },
        {
            id: "disposal",
            label: "Disposal",
            href: "disposal.html",
            svg: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
        },
        {
            id: "reports",
            label: "Reports",
            href: "reports.html",
            svg: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
        }
    ];

    const isStaff = user.role === "staff";
    const restrictedForStaff = ["transfer", "maintenance", "audit", "disposal"];
    const visibleNavItems = isStaff
        ? navItems.filter(item => !restrictedForStaff.includes(item.id))
        : navItems;

    navEl.innerHTML = `
        <div class="nav-container">
            <a href="index.html" class="nav-brand" style="display: flex; align-items: center; gap: 10px; flex-shrink: 0; text-decoration: none;">
                <img src="mmcoe.jpg" alt="MMCOE Logo" style="height: 38px; width: 38px; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--border-color); flex-shrink: 0; display: block;">
                <div class="brand-text" style="display: flex; flex-direction: column; justify-content: center; line-height: 1.2;">
                    <h1 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; line-height: 1.2;">MMCOE AssetHub</h1>
                    <p style="font-size: 10.5px; color: var(--text-muted); font-weight: 600; margin: 0; white-space: nowrap; line-height: 1.2;">Asset Tracking &amp; Barcode</p>
                </div>
            </a>

            <ul class="nav-menu">
                ${visibleNavItems.map(item => `
                    <li>
                        <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}">
                            ${item.svg}
                            <span>${item.label}</span>
                        </a>
                    </li>
                `).join("")}
            </ul>

            <div class="nav-user">
                <div class="user-avatar" title="${user.name} (${roleTitle})" style="cursor: pointer; width: 34px; height: 34px; font-size: 13px; font-weight: 700; border: 2px solid #e2e8f0;">
                    ${initials}
                </div>
                <button class="btn-logout" title="Sign Out (${user.name})" onclick="Auth.logout()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;
}
