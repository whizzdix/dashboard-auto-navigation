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
    
    // Die Event-Listener werden beim Initialisieren hinzugefügt.
    this.addListeners();
    this.startIdleTimer();
  }
  
  addListeners() {
    this.events.forEach(event => {
      // NEU: { capture: true } fängt das Event früh ab.
      // { passive: true } verbessert die Performance, besonders bei scroll und touch.
      window.addEventListener(event, this.handleActivity, { capture: true, passive: true });
    });
  }
  
  removeListeners() {
    this.events.forEach(event => {
      // Wichtig: Die Optionen beim Entfernen müssen mit denen beim Hinzufügen übereinstimmen.
      window.removeEventListener(event, this.handleActivity, { capture: true, passive: true });
    });
  }

  connectedCallback() {
    super.connectedCallback();
    // Sicherstellen, dass die Listener aktiv sind, wenn die Karte (wieder) ins DOM kommt.
    this.removeListeners(); // Zuerst alte entfernen, um Duplikate zu vermeiden
    this.addListeners();
    this.startIdleTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Alle Timer und Event-Listener sauber entfernen, wenn die Karte das DOM verlässt.
    this.removeListeners();
    clearTimeout(this.idleTimer);
    clearTimeout(this.debounceTimer);
  }

  handleActivity() {
    clearTimeout(this.idleTimer);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.startIdleTimer(), 200);
  }

  startIdleTimer() {
    this.idleTimer = setTimeout(this.goHome, this.timeout * 1000);
  }

  goHome() {
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

