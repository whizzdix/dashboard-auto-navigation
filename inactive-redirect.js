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
    // 'wheel' und 'scroll' zur Liste der Events hinzugefügt
    this.events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel', 'scroll'];

    this.handleActivity = this.handleActivity.bind(this);
    this.goHome = this.goHome.bind(this);

    this.events.forEach(event => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });

    this.startIdleTimer();
  }

  connectedCallback() {
    super.connectedCallback();
    // Event-Listener beim Wiederverbinden neu starten
    this.events.forEach(event => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
    this.startIdleTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Alle Timer und Event-Listener sauber entfernen
    this.events.forEach(event => {
      window.removeEventListener(event, this.handleActivity, true);
    });
    clearTimeout(this.idleTimer);
    clearTimeout(this.debounceTimer);
  }

  handleActivity() {
    // Den Haupt-Timeout bei jeder Aktivität sofort stoppen
    clearTimeout(this.idleTimer);

    // Debounce-Logik: Starte den Haupt-Timeout erst,
    // nachdem für 200ms keine neue Aktivität erkannt wurde.
    // Dies verhindert, dass der Timer bei schnellen Events wie Scrollen ständig neu erstellt wird.
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.startIdleTimer(), 200);
  }

  startIdleTimer() {
    this.idleTimer = setTimeout(this.goHome, this.timeout * 1000);
  }

  goHome() {
    // Prüfen, ob wir uns bereits auf der Zielseite befinden, um unnötige Navigation zu vermeiden
    if (window.location.pathname !== this.redirect_path) {
      window.history.pushState(null, null, this.redirect_path);
      const navEvent = new CustomEvent("location-changed", {
        detail: { replace: false },
      });
      window.dispatchEvent(navEvent);
    }
  }

  render() {
    // Diese Komponente hat keine sichtbare Oberfläche
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
