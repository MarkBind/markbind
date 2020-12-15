var cheerio = module.parent.require('cheerio');
var COPY_ICON = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n  width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" version=\"1.1\">\n    <g id=\"surface1\">\n      <path d=\"M 11.273438 0 L 2.546875 0 C 1.746094 0 1.089844 0.613281 1.089844\n      1.363281 L 1.089844 10.910156 L 2.546875 10.910156 L 2.546875 1.363281 L 11.273438\n      1.363281 Z M 13.453125 2.726562 L 5.453125 2.726562 C 4.65625 2.726562 4 3.339844 4\n      4.089844 L 4 13.636719 C 4 14.386719 4.65625 15 5.453125 15 L 13.453125 15 C 14.253906\n      15 14.910156 14.386719 14.910156 13.636719 L 14.910156 4.089844 C 14.910156 3.339844\n      14.253906 2.726562 13.453125 2.726562 Z M 13.453125 13.636719 L 5.453125 13.636719 L\n      5.453125 4.089844 L 13.453125 4.089844 Z M 13.453125 13.636719 \"/>\n    </g>\n</svg>\n";
function getButtonHTML() {
    var html = "<button onclick=\"copyCodeBlock(this)\" class=\"copy-btn\">\n    <div class=\"copy-btn-body\">\n    " + COPY_ICON + "\n    </div>\n    </button>";
    return html;
}
var copyCodeBlockScript = "<script>\n    function copyCodeBlock(element) {\n        const pre = element.parentElement;\n        const codeElement = pre.querySelector('code');\n\n        // create dummy text element to select() the text field\n        const textElement = document.createElement('textarea');\n        textElement.value = codeElement.textContent;\n        document.body.appendChild(textElement);\n        textElement.select();\n\n        document.execCommand('copy');\n        document.body.removeChild(textElement);\n    }\n    </script>";
module.exports = {
    getScripts: function () { return [copyCodeBlockScript]; },
    processNode: function (pluginContext, node) {
        if (node.name !== 'pre') {
            return;
        }
        cheerio(node).append(getButtonHTML());
    },
};
