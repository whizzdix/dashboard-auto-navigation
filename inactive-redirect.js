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

    this.timer = null;
    this.events = ['mousemove', 'mousedown', 'touchstart', 'keydown'];

    this.resetTimer = this.resetTimer.bind(this);
    this.goHome = this.goHome.bind(this);

    this.events.forEach(event => {
      window.addEventListener(event, this.resetTimer, true);
    });

    this.resetTimer();
  }

  connectedCallback() {
    super.connectedCallback();
    this.resetTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.events.forEach(event => {
      window.removeEventListener(event, this.resetTimer, true);
    });
    clearTimeout(this.timer);
  }

  resetTimer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.goHome, this.timeout * 1000);
  }

  goHome() {
    window.history.pushState(null, null, this.redirect_path);
    const navEvent = new CustomEvent("location-changed", {
      detail: { replace: false },
    });
    window.dispatchEvent(navEvent);
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
