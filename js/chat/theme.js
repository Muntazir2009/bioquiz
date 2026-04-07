/**
 * Theme Manager Module
 * Handles dark/light theme switching
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.themes = {
      dark: {
        name: 'Dark',
        primary: '#00d9ff',
        secondary: '#1a1a2e',
        background: '#0f0f1e',
        surface: '#16213e',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#2a2a4e',
        accent: '#ff006e'
      },
      light: {
        name: 'Light',
        primary: '#0099cc',
        secondary: '#f5f5f5',
        background: '#ffffff',
        surface: '#f9f9f9',
        text: '#1a1a1a',
        textSecondary: '#666666',
        border: '#e0e0e0',
        accent: '#d4006e'
      }
    };
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    return localStorage.getItem('chat_theme') || 'dark';
  }

  saveTheme(theme) {
    localStorage.setItem('chat_theme', theme);
    this.currentTheme = theme;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  setTheme(theme) {
    if (!this.themes[theme]) {
      console.warn(`[Theme] Unknown theme: ${theme}`);
      return;
    }
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    const colors = this.themes[theme];
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    document.body.dataset.theme = theme;
  }

  getTheme() {
    return this.currentTheme;
  }

  getThemeColors(theme = this.currentTheme) {
    return this.themes[theme];
  }

  getCurrentThemeColors() {
    return this.themes[this.currentTheme];
  }
}

export default ThemeManager;
