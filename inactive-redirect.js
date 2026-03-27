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

  setupEventListeners() {
    if (!this._initialized) {
      // pointerdown und pointermove sind performanter und auf modernen Browsern 
      // (wie Fully Kiosk / Chrome) zuverlässiger für Touch und Maus.
      this.events = ['touchstart', 'pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll'];
      this.handleActivity = this.handleActivity.bind(this);
      this.goHome = this.goHome.bind(this);
      this._initialized = true;
    }
  }

  clearTimers() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  setConfig(config) {
    this._config = config;
    this.timeout = this._config.timeout || 60;
    this.redirect_path = this._config.redirect_path;

    if (!this.redirect_path) {
      throw new Error("You need to define a redirect_path");
    }

    this.setupEventListeners();

    if (this.isConnected) {
      // Wenn das Element im DOM ist und eine neue Konfiguration erhält
      this.resetTimer();
    }
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
    this.setupEventListeners();
    this.removeListeners(); // Zur Sicherheit alte entfernen, um Duplikate zu vermeiden
    this.addListeners();
    this.resetTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
    this.clearTimers();
  }

  handleActivity() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === '1') {
      this.clearTimers();
      return;
    }

    this.resetTimer();
  }

  resetTimer() {
    this.clearTimers();
    this.debounceTimer = setTimeout(() => this.startIdleTimer(), 200);
  }

  startIdleTimer() {
    this.clearTimers();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === '1') {
      return;
    }
    this.idleTimer = setTimeout(this.goHome, this.timeout * 1000);
  }

  goHome() {
    const urlParams = new URLSearchParams(window.location.search);
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
