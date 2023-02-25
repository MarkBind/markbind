import { DomElement } from 'htmlparser2';
import cheerio from 'cheerio';
import has from 'lodash/has';
import { PluginContext } from './Plugin';

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

const DEFAULT_INPUTS = `${NAME_INPUT}\n${EMAIL_INPUT}\n${MESSAGE_INPUT}\n${SUBMIT_BUTTON}`;

const FORM_CONTAINER = '<box type="info" no-icon><h2>Contact Us</h2></box>';

function hasSubmitButton(node: cheerio.Element & DomElement) {
  const $node = cheerio(node);
  return $node.children('[type=submit]').length !== 0;
}
function createMinimalForm(pluginContext: PluginContext) {
  const $replaceNode = cheerio('<form onsubmit="submitForm(this)"></form>');
  $replaceNode.append(`<input type="hidden" name="access_key" value=${pluginContext.accessKey}>`);
  return $replaceNode;
}
function createWeb3Form(pluginContext: PluginContext, node: cheerio.Element & DomElement) {
  const $node = cheerio(node);
  const $formNode = createMinimalForm(pluginContext);
  $formNode.append($node.children());
  if (!hasSubmitButton(node)) {
    $formNode.append(SUBMIT_BUTTON);
  }
  const $formWrapper = cheerio(FORM_CONTAINER);
  $formWrapper.append($formNode);
  $node.replaceWith($formWrapper);
}

function isDefaultContactForm(node: cheerio.Element & DomElement) {
  if (!node.attribs) {
    return false;
  }
  return _.has(node.attribs, 'default');
}
function createDefaultContactForm(pluginContext: PluginContext, node: cheerio.Element & DomElement) {
  const $node = cheerio(node);
  const $formNode = createMinimalForm(pluginContext);
  $formNode.append(DEFAULT_INPUTS);
  const $formWrapper = cheerio(FORM_CONTAINER);
  $formWrapper.append($formNode);
  $node.replaceWith($formWrapper);
}

const submitFormScript = `
    <script>
        function submitForm(element) {
            event.preventDefault();
            const formData = new FormData(element);
            const formProps = Object.fromEntries(formData);
            const json = JSON.stringify(formProps);
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
                    alert('Error submitting form! Pleas try again later.');
                }
            })
            .catch(error => {
                alert('Error submitting form! Please try again later.');
            })
        }
    </script>`;

export = {
  processNode: (pluginContext: PluginContext, node: cheerio.Element & DomElement) => {
    if (node.name !== 'web-3-form') {
      return;
    }
    if (isDefaultContactForm(node)) {
      createDefaultContactForm(pluginContext, node);
    }
    createWeb3Form(pluginContext, node);
  },
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  getScripts: () => [submitFormScript],
};
