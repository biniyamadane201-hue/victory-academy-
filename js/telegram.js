/**
 * VICTORY ACADEMY - TELEGRAM WEB APP ADAPTER
 */
const TelegramAdapter = {
  tg: window.Telegram ? window.Telegram.WebApp : null,

  init() {
    if (!this.tg) {
      console.info("Victory Academy: Running in standard browser environment.");
      return;
    }

    try {
      this.tg.ready();
      this.tg.expand();
      this.applyTelegramTheme();
      this.setupBackButton();
      this.displayTelegramUser();
      console.info("Victory Academy: Telegram WebApp successfully initialized.");
    } catch (e) {
      console.warn("Telegram SDK initialization error:", e);
    }
  },

  isInsideTelegram() {
    return Boolean(this.tg && this.tg.initData && this.tg.initData.length > 0);
  },

  getUserData() {
    if (this.tg && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      return this.tg.initDataUnsafe.user;
    }
    return {
      first_name: "University",
      last_name: "Scholar",
      username: "scholar_demo",
      id: "99887766"
    };
  },

  displayTelegramUser() {
    const user = this.getUserData();
    const userElement = document.getElementById("student-name-display");
    if (userElement) {
      userElement.textContent = `${user.first_name} ${user.last_name || ""}`.trim();
    }
  },

  applyTelegramTheme() {
    if (!this.tg || !this.tg.themeParams) return;
    const theme = this.tg.themeParams;
    const root = document.documentElement;
    if (theme.bg_color) root.style.setProperty("--bg-primary", theme.bg_color);
    if (theme.secondary_bg_color) root.style.setProperty("--bg-secondary", theme.secondary_bg_color);
    if (theme.text_color) root.style.setProperty("--text-main", theme.text_color);
    if (theme.button_color) root.style.setProperty("--royal-blue", theme.button_color);
  },

  setupBackButton() {
    if (!this.tg || !this.tg.BackButton) return;
    const isHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    if (!isHomePage) {
      this.tg.BackButton.show();
      this.tg.BackButton.onClick(() => window.history.back());
    } else {
      this.tg.BackButton.hide();
    }
  }
};

document.addEventListener("DOMContentLoaded", () => TelegramAdapter.init());
