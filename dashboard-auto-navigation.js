console.log('[Dashboard Auto-Navigation] Loading...');

class DashboardAutoNavigation {
  constructor() {
    this.timer = null;
    this.config = null;
    this.boundResetTimer = this.resetTimer.bind(this);
    this.boundLocationChanged = this.onLocationChanged.bind(this);
    this.boundCheckPanel = this.checkPanelLoaded.bind(this);
    this.isMonitoring = false;
    this.retryCount = 0;
    this.maxRetries = 100;
  }

  init() {
    console.log('[Dashboard Auto-Navigation] Initializing...');
    
    // Warte auf ha-panel-lovelace Element
    this.waitForPanel();
  }

  waitForPanel() {
    const panel = document.querySelector('ha-panel-lovelace');
    
    if (panel) {
      console.log('[Dashboard Auto-Navigation] Panel found');
      this.setupPanelObserver(panel);
      this.checkPanelLoaded();
    } else if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => this.waitForPanel(), 100);
    } else {
      console.error('[Dashboard Auto-Navigation] Panel not found after retries');
    }
  }

  setupPanelObserver(panel) {
    // Beobachte Panel für Änderungen
    const observer = new MutationObserver(() => {
      this.checkPanelLoaded();
    });

    observer.observe(panel, {
      childList: true,
      subtree: true
    });

    // Lausche auf location-changed Events
    window.addEventListener('location-changed', this.boundLocationChanged);
  }

  checkPanelLoaded() {
    const panel = document.querySelector('ha-panel-lovelace');
    if (!panel) return;

    // Versuche auf verschiedene Arten auf Lovelace zuzugreifen
    let lovelace = panel.lovelace || 
                   panel._lovelace || 
                   window.lovelace;

    // Alternative: Suche im Shadow DOM
    if (!lovelace && panel.shadowRoot) {
      const huiRoot = panel.shadowRoot.querySelector('hui-root');
      if (huiRoot) {
        lovelace = huiRoot.lovelace || huiRoot._lovelace;
      }
    }

    if (lovelace?.config?.views) {
      console.log('[Dashboard Auto-Navigation] Lovelace config found');
      this.extractConfig(lovelace);
      
      if (this.config) {
        this.startMonitoring();
      }
    }
  }

  onLocationChanged() {
    console.log('[Dashboard Auto-Navigation] Location changed');
    
    // Stoppe aktuelles Monitoring
    this.stopMonitoring();
    
    // Warte kurz und prüfe dann die neue View
    setTimeout(() => {
      this.checkPanelLoaded();
    }, 500);
  }

  extractConfig(lovelace) {
    this.config = null;
    
    try {
      if (!lovelace?.config?.views) {
        console.log('[Dashboard Auto-Navigation] No views in lovelace config');
        return;
      }

      // Hole aktuelle View aus URL
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      let viewPath = null;
      
      // Parse verschiedene URL-Formate
      if (hash.includes('/')) {
        const parts = hash.split('/');
        viewPath = parts[parts.length - 1] || parts[parts.length - 2];
      } else if (path.includes('/lovelace/')) {
        viewPath = path.split('/lovelace/')[1]?.split('/')[0];
      }

      // Finde View
      let currentView = null;
      
      if (viewPath && viewPath !== '' && viewPath !== '0') {
        currentView = lovelace.config.views.find(view => view.path === viewPath);
      }
      
      // Fallback zur ersten View oder View mit Index 0
      if (!currentView) {
        if (viewPath === '0' || !viewPath) {
          currentView = lovelace.config.views[0];
        }
      }

      if (currentView?.auto_navigation) {
        this.config = currentView.auto_navigation;
        console.log('[Dashboard Auto-Navigation] Config found:', {
          timeout: this.config.timeout,
          target_path: this.config.target_path,
          view_title: currentView.title || currentView.path
        });
      } else {
        console.log('[Dashboard Auto-Navigation] No auto_navigation config for current view');
      }
    } catch (error) {
      console.error('[Dashboard Auto-Navigation] Error extracting config:', error);
    }
  }

  startMonitoring() {
    if (!this.config?.timeout || !this.config?.target_path) {
      console.warn('[Dashboard Auto-Navigation] Invalid config:', this.config);
      return;
    }

    if (this.isMonitoring) {
      console.log('[Dashboard Auto-Navigation] Already monitoring, skipping');
      return;
    }

    this.isMonitoring = true;
    console.log(`[Dashboard Auto-Navigation] ✓ Monitoring started - ${this.config.timeout}s timeout → ${this.config.target_path}`);

    // Event-Listener für User-Aktivität
    const events = ['mousemove', 'mousedown', 'touchstart', 'touchmove', 'keydown', 'scroll', 'wheel', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.boundResetTimer, { passive: true });
    });

    // Starte Timer
    this.resetTimer();
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    console.log('[Dashboard Auto-Navigation] Monitoring stopped');

    // Stoppe Timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Entferne Event-Listener
    const events = ['mousemove', 'mousedown', 'touchstart', 'touchmove', 'keydown', 'scroll', 'wheel', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.boundResetTimer);
    });
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
    const targetPath = this.config.target_path;
    console.log(`[Dashboard Auto-Navigation] ⏰ Timeout reached, navigating to ${targetPath}`);
    
    // Prüfe ob wir bereits auf der Zielseite sind
    const currentLocation = window.location.pathname + window.location.hash;
    if (currentLocation.includes(targetPath)) {
      console.log('[Dashboard Auto-Navigation] Already on target page, stopping');
      this.stopMonitoring();
      return;
    }

    // Stoppe Monitoring vor Navigation
    this.stopMonitoring();

    // Navigiere
    const targetUrl = targetPath.startsWith('/') ? targetPath : `/lovelace/${targetPath}`;
    
    // Verwende die HA Navigation API wenn verfügbar
    const panel = document.querySelector('ha-panel-lovelace');
    if (panel && typeof panel.navigate === 'function') {
      panel.navigate(targetUrl);
    } else {
      // Fallback: Standard Navigation
      window.history.pushState(null, '', targetUrl);
      window.dispatchEvent(new CustomEvent('location-changed', {
        detail: { replace: false }
      }));
    }
    
    console.log('[Dashboard Auto-Navigation] Navigation executed');
  }
}

// Warte auf vollständiges Laden des DOM
function initAutoNavigation() {
  console.log('[Dashboard Auto-Navigation] DOM ready, starting initialization');
  
  // Kleine Verzögerung für HA-Initialisierung
  setTimeout(() => {
    window.dashboardAutoNavigation = new DashboardAutoNavigation();
    window.dashboardAutoNavigation.init();
  }, 1000);
}

// Verschiedene Initialisierungspunkte
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoNavigation);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initAutoNavigation();
}

console.log('[Dashboard Auto-Navigation] Script loaded successfully');
