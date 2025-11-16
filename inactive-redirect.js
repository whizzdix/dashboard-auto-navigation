const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

class InactiveRedirect extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    this._config = config;
    this.timeout = this._config.timeout || 60;
    this.redirect_path = this._config.redirect_path;

    if (!this.redirect_path) {
      throw new Error("You need to define a redirect_path");
    }

    this.idleTimer = null;
    this.debounceTimer = null;
    this.events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel', 'scroll'];

    this.handleActivity = this.handleActivity.bind(this);
    this.goHome = this.goHome.bind(this);
    
    this.addListeners();
    this.startIdleTimer();
  }
  
  addListeners() {
    this.events.forEach(event => {
      window.addEventListener(event, this.handleActivity, { capture: true, passive: true });
    });
  }
  
  removeListeners() {
    this.events.forEach(event => {
      window.removeEventListener(event, this.handleActivity, { capture: true, passive: true });
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.removeListeners(); 
    this.addListeners();
    this.startIdleTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
    clearTimeout(this.idleTimer);
    clearTimeout(this.debounceTimer);
  }

  handleActivity() {
    const urlParams = new URLSearchParams(window.location.search);
    // NEU: Prüfen, ob der 'edit=1' Parameter in der URL vorhanden ist.
    if (urlParams.get('edit') === '1') {
      // Wenn wir im Bearbeitungsmodus sind, stoppe alle Timer und tue nichts weiter.
      clearTimeout(this.idleTimer);
      clearTimeout(this.debounceTimer);
      return;
    }

    // Die normale Timer-Logik wird nur ausgeführt, wenn nicht im Bearbeitungsmodus.
    clearTimeout(this.idleTimer);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.startIdleTimer(), 200);
  }

  startIdleTimer() {
    // Vor dem Starten des Timers ebenfalls prüfen, um sicherzugehen.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === '1') {
      return;
    }
    this.idleTimer = setTimeout(this.goHome, this.timeout * 1000);
  }

  goHome() {
    const urlParams = new URLSearchParams(window.location.search);
    // NEU: Doppelte Sicherheitsprüfung vor der eigentlichen Weiterleitung.
    if (urlParams.get('edit') === '1') {
      return;
    }

    if (window.location.pathname !== this.redirect_path) {
      window.history.pushState(null, null, this.redirect_path);
      const navEvent = new CustomEvent("location-changed", {
        detail: { replace: false },
      });
      window.dispatchEvent(navEvent);
    }
  }

  render() {
    return html``;
  }

  getCardSize() {
    return 0;
  }
}

customElements.define('inactive-redirect', InactiveRedirect);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "inactive-redirect",
  name: "Inactive Redirect",
  preview: false,
  description: "A custom card that redirects to a specific page after a period of inactivity."
});
