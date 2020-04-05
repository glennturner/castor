class Podcast {
  constructor (args) {
    [
      'id', 'identity', 'artwork', 'title', 'feed'
    ].map((key) => {
      this[key] = args[key];
    });
  }

  showHTML () {
    console.log( 'DOC?')
    console.log(document.getElementsByTagName('body'))
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

        <div
          class="capsule-player"
        >
          <span
            class="btn btn-primary btn-play"
          >
            &#9657;
          </span>
          <span
            class="btn btn-secondary btn-settings"
          >
            &#8943;
        </div>
      </div>
    `;
  }
}
