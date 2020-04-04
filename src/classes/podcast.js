class Podcast {
  constructor(args) {
    [
      'id', 'identity', 'artwork', 'title'
    ].map((key) => {
      this[key] = args[key];
    });
  }

  showHTML() {
    return `
      <div
        class="podcast-show"
      >
        <img
          src="${this.artwork}"
        />
        <div
          class="title"
        >
          ${this.title}
        </div>
        <div
          class="identity"
        >
          ${this.identity}
        </div>
      </div>
    `;
  }
}
