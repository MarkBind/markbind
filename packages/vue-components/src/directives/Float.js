module.exports = {
  bind() {
    const wrappingElement = document.createElement('div');
    this.el.replaceWith(wrappingElement);
    wrappingElement.appendChild(this.el);
  },
  update(direction) {
    this.el.style.float = direction;
    console.log(direction);
  }
};
