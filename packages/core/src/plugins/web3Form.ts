import cheerio from 'cheerio';
import has from 'lodash/has';
import { PluginContext } from './Plugin';
import { MbNode } from '../utils/node';

const md = require('../lib/markdown-it');

const _ = {
  has,
};

const CSS_FILE_NAME = 'web3FormAssets/web-3-form.css';

const NAME_INPUT = '<label for="name">Name</label>\n'
    + '<input type="text" name="name" required placeholder="John Doe">';
const EMAIL_INPUT = '<label for="email">Email</label>\n'
    + '<input type="email" name="email" required placeholder="johndoe@gmail.com">';
const MESSAGE_INPUT = '<label for="message">Message</label>\n'
    + '<textarea name="message" required></textarea>';
const SUBMIT_BUTTON = '<button type="submit" class="badge bg-info">Submit</button>';
const DEFAULT_HEADER = '<p class="h2">Contact Us</p>';
const DEFAULT_INPUTS = `${NAME_INPUT}\n${EMAIL_INPUT}\n${MESSAGE_INPUT}\n${SUBMIT_BUTTON}`;

function createMinimalForm(pluginContext: PluginContext) {
  const $replaceNode = cheerio('<form onsubmit="submitForm(this)"></form>');
  $replaceNode.append(`<input type="hidden" name="access_key" value=${pluginContext.accessKey}>`);
  return $replaceNode;
}

function deleteWeb3FormAttributes(node: MbNode) {
  delete node.attribs.default;
  delete node.attribs.header;
}

function transformFormInputs(child: cheerio.Element) {
  if (child.type !== 'tag') {
    return;
  }
  const $node = cheerio(child);
  switch (child.name) {
  case 'name-input':
    $node.replaceWith(NAME_INPUT);
    break;
  case 'email-input':
    $node.replaceWith(EMAIL_INPUT);
    break;
  case 'message-input':
    $node.replaceWith(MESSAGE_INPUT);
    break;
  case 'submit-button':
    $node.replaceWith(SUBMIT_BUTTON);
    break;
  default:
  }
}

function generateFormContainer(node: MbNode) {
  if (node.type !== 'tag') {
    return;
  }
  node.name = 'box';
  const $node = cheerio(node);
  $node.addClass('web3Form');
  if (!_.has(node.attribs, 'type')) {
    $node.attr('type', 'info');
  }
  $node.attr('no-icon', '');
  if (_.has(node.attribs, 'header')) {
    const header = md.render($node.prop('header'));
    const $headerNode = cheerio(header);
    $node.prepend($headerNode);
  }
}

function createCustomForm(pluginContext: PluginContext, node: MbNode) {
  const $node = cheerio(node);
  const $formNode = createMinimalForm(pluginContext);
  $formNode.append($node.children());
  $formNode.children().each((index, child) => {
    transformFormInputs(child);
  });
  $node.append($formNode);
  generateFormContainer(node);
  deleteWeb3FormAttributes(node);
}

function isDefaultContactForm(node: MbNode) {
  return _.has(node.attribs, 'default');
}

function createDefaultContactForm(pluginContext: PluginContext, node: MbNode) {
  const $node = cheerio(node);
  if (!_.has(node.attribs, 'header')) {
    $node.attr('header', DEFAULT_HEADER);
  }
  const $formNode = createMinimalForm(pluginContext);
  $formNode.append(DEFAULT_INPUTS);
  $node.append($formNode);
  generateFormContainer(node);
  deleteWeb3FormAttributes(node);
}

const submitFormScript = `
    <script>
        function submitForm(element) {
            event.preventDefault();
            const formData = new FormData(element);
            const formProps = Object.fromEntries(formData);
            const json = JSON.stringify(formProps);
            const submitButton = element.querySelector('button[type="submit"]');
            const submitButtonText = submitButton.innerText;
            submitButton.innerText = 'Please wait...'
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json,
            })
            .then(async (response) => {
                if (response.status == 200) {
                    alert('Form submitted! Thank you for your response');
                } else {
                    alert('Error submitting form! Please try again later.');
                }
            })
            .catch(error => {
                alert('Error submitting form! Please try again later.');
            })
            .finally(() => {
                submitButton.innerText = submitButtonText;
            })
        }
    </script>`;

export = {
  processNode: (pluginContext: PluginContext, node: MbNode) => {
    if (node.name !== 'web-3-form') {
      return;
    }
    if (isDefaultContactForm(node)) {
      createDefaultContactForm(pluginContext, node);
      return;
    }
    createCustomForm(pluginContext, node);
  },
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  getScripts: () => [submitFormScript],
};
