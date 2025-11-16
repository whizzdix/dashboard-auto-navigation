class DashboardAutoNavigation extends HTMLElement {
  constructor() {
    super();
    this.timer = null;
    this.config = null;
    this.boundResetTimer = this.resetTimer.bind(this);
  }

  connectedCallback() {
    this.setupAutoNavigation();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  setupAutoNavigation() {
    // Warte auf das Lovelace-Objekt
    this.waitForLovelace().then(() => {
      this.extractConfig();
      if (this.config) {
        this.startMonitoring();
      }
    });
  }

  async waitForLovelace() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!window.lovelace && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.lovelace) {
      console.error('[Dashboard Auto-Navigation] Lovelace not found');
    }
  }

  extractConfig() {
    try {
      const lovelace = window.lovelace;
      if (!lovelace || !lovelace.config || !lovelace.config.views) {
        return;
      }

      // Hole die aktuelle View
      const currentPath = window.location.pathname;
      const currentView = lovelace.config.views.find(view => {
        const viewPath = `/lovelace/${view.path || 0}`;
        return currentPath.includes(viewPath) || 
               (view.path === undefined && currentPath === '/lovelace/0');
      });

      if (currentView && currentView.auto_navigation) {
        this.config = currentView.auto_navigation;
        console.log('[Dashboard Auto-Navigation] Config loaded:', this.config);
      }
    } catch (error) {
      console.error('[Dashboard Auto-Navigation] Error extracting config:', error);
    }
  }

  startMonitoring() {
    if (!this.config || !this.config.timeout || !this.config.target_path) {
      console.warn('[Dashboard Auto-Navigation] Invalid config:', this.config);
      return;
    }

    console.log(`[Dashboard Auto-Navigation] Starting monitoring - timeout: ${this.config.timeout}s, target: ${this.config.target_path}`);

    // Event-Listener hinzufügen
    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, this.boundResetTimer, { passive: true });
    });

    // Initiale Timer-Start
    this.resetTimer();
  }

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.navigate();
    }, this.config.timeout * 1000);
  }

  navigate() {
    console.log(`[Dashboard Auto-Navigation] Navigating to ${this.config.target_path}`);
    
    // Prüfe ob wir bereits auf der Zielseite sind
    if (window.location.pathname.includes(this.config.target_path)) {
      console.log('[Dashboard Auto-Navigation] Already on target page');
      return;
    }

    // Navigation durchführen
    window.history.pushState(null, '', this.config.target_path);
    window.dispatchEvent(new CustomEvent('location-changed'));
  }

  cleanup() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.removeEventListener(event, this.boundResetTimer);
    });
  }
}

// Registriere das Custom Element
if (!customElements.get('dashboard-auto-navigation')) {
  customElements.define('dashboard-auto-navigation', DashboardAutoNavigation);
  console.log('[Dashboard Auto-Navigation] Custom element registered');
}

// Erstelle und füge das Element zum DOM hinzu
const autoNavElement = document.createElement('dashboard-auto-navigation');
document.body.appendChild(autoNavElement);

console.log('[Dashboard Auto-Navigation] Loaded successfully');
