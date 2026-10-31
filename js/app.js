/**
 * VICTORY ACADEMY - CORE APPLICATION SCRIPT
 * Theme management, Toast notification system, and Global utilities
 */

const App = {
  THEME_KEY: "va_theme",

  init() {
    this.setupTheme();
    this.setupMobileMenu();
  },

  setupTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.textContent = savedTheme === "light" ? "🌙" : "🌓";
      toggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(this.THEME_KEY, newTheme);
        toggleBtn.textContent = newTheme === "light" ? "🌙" : "🌓";
        App.showToast(`Switched to ${newTheme} mode`, "info");
      });
    }
  },

  setupMobileMenu() {
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener("click", () => {
        navMenu.classList.toggle("is-open");
      });
    }
  },

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
