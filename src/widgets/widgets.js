const pumlWidget = require('./puml');

const WIDGETS = {
  puml: new pumlWidget.Puml(),
};

function preprocessWidget(config, context, element) {
  const widget = WIDGETS[element.name];
  if (widget === undefined) {
    return element;
  }

  return widget.preprocess(config, context, element);
}

function parseWidget(config, context, element) {
  const widget = WIDGETS[element.name];
  if (widget === undefined) {
    return element;
  }

  return widget.parse(config, context, element);
}

module.exports = {
  preprocessWidget,
  parseWidget,
};
