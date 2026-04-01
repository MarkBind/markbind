<template>
  <button
    v-if="enabled"
    type="button"
    class="btn btn-sm btn-outline-secondary dark-mode-toggle"
    :aria-label="buttonLabel"
    :title="buttonLabel"
    @click="toggleTheme"
  >
    <span class="dark-mode-toggle-icon" aria-hidden="true">
      <svg
        v-if="resolvedTheme === 'dark'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <!-- crescent moon shape -->
        <path d="M6 0a.75.75 0 0 1 .722.954 6.5 6.5 0 1 0 8.324 8.324A.75.75 0 0 1 16 10a8 8 0 1 1-10-10z" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <!-- svg for sun rays -->
        <path
          d="M8 1a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0V1.5A.5.5 0 0 1 8 1zm0 10
          a.5.5 0 0 1 .5.5V13a.5.5 0 0 1-1 0v-1.5A.5.5 0 0 1 8 11zm7-3a.5.5 0 0
          1-.5.5H13a.5.5 0 0 1 0-1h1.5A.5.5 0 0 1 15 8zM3 8a.5.5 0 0 1-.5.5H1a.5.5
          0 0 1 0-1h1.5A.5.5 0 0 1 3 8zm9.95-4.536a.5.5 0 0 1 0 .707L11.89 5.232a.5.5
          0 1 1-.707-.707l1.06-1.061a.5.5 0 0 1 .707 0zM4.818 11.182a.5.5 0 0 1 0
          .707l-1.06 1.061a.5.5 0 1 1-.708-.707l1.061-1.06a.5.5 0 0 1 .707 0zm8.132
          1.768a.5.5 0 0 1-.707 0l-1.06-1.06a.5.5 0 1 1 .707-.708l1.06 1.061a.5.5
          0 0 1 0 .707zM4.818 4.818a.5.5 0 0 1-.707 0L3.05 3.757a.5.5 0 0 1 .708
          -.707l1.06 1.06a.5.5 0 0 1 0 .708z"
        />
        <!-- circle for sun core -->
        <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
      </svg>
    </span>
  </button>
</template>

<script>
const STORAGE_KEY = 'markbind-theme';
const DARK = 'dark';
const LIGHT = 'light';

export default {
  data() {
    return {
      enabled: typeof window !== 'undefined' && window.__MARKBIND_DARK_MODE__ === true,
      resolvedTheme: LIGHT,
      themePreference: null,
      mediaQueryList: null,
    };
  },
  computed: {
    buttonLabel() {
      return this.resolvedTheme === DARK
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    },
  },
  mounted() {
    if (!this.enabled) {
      return;
    }
    this.themePreference = this.getStoredTheme();
    this.applyTheme(this.themePreference);

    if (window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      if (this.mediaQueryList.addEventListener) {
        this.mediaQueryList.addEventListener('change', this.handleSystemThemeChange);
      } else {
        this.mediaQueryList.addListener(this.handleSystemThemeChange);
      }
    }
  },
  beforeUnmount() {
    if (!this.mediaQueryList) {
      return;
    }

    if (this.mediaQueryList.removeEventListener) {
      this.mediaQueryList.removeEventListener('change', this.handleSystemThemeChange);
    } else {
      this.mediaQueryList.removeListener(this.handleSystemThemeChange);
    }
  },
  methods: {
    getStoredTheme() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === DARK || stored === LIGHT ? stored : null;
      } catch (e) {
        return null;
      }
    },
    getSystemTheme() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? DARK
        : LIGHT;
    },
    applyTheme(preference) {
      const resolved = preference || this.getSystemTheme();
      this.themePreference = preference;
      this.resolvedTheme = resolved;
      document.documentElement.setAttribute('data-bs-theme', resolved);
      if (document.body) {
        document.body.setAttribute('data-code-theme', resolved);
      }
      this.updateCodeThemeStylesheets(resolved);
    },
    updateCodeThemeStylesheets(theme) {
      const lightSheet = document.getElementById('markbind-highlight-light');
      const darkSheet = document.getElementById('markbind-highlight-dark');
      if (lightSheet && darkSheet) {
        lightSheet.disabled = theme !== LIGHT;
        darkSheet.disabled = theme !== DARK;
      }
    },
    handleSystemThemeChange() {
      if (!this.themePreference) {
        this.applyTheme(null);
      }
    },
    toggleTheme() {
      const nextTheme = this.resolvedTheme === DARK ? LIGHT : DARK;
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (e) {
        // Ignore storage errors.
      }
      this.applyTheme(nextTheme);
    },
  },
};
</script>

<style scoped>
    .dark-mode-toggle {
        align-items: center;
        border-radius: 999px;
        display: inline-flex;
        height: 2.25rem;
        justify-content: center;
        padding: 0;
        width: 2.25rem;
    }

    .dark-mode-toggle-icon {
        display: flex;
    }

    .dark-mode-toggle-icon svg {
        height: 1rem;
        width: 1rem;
    }
</style>
