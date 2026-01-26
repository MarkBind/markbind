module.exports = {
  beforeMount() {
    const wrappingElement = document.createElement('div');
    this.el.replaceWith(wrappingElement);
    wrappingElement.appendChild(this.el);
  },
  updated(direction) {
    this.el.style.float = direction;
    console.log(direction);
  }
};
