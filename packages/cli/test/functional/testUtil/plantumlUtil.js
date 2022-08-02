const fs = require('fs-extra');

const plantumlGeneratedFiles = [
  'test_site/expected/9c9e77fc0a983cb6b592e65733787bec.png',
  'test_site/expected/inline-output.png',
  'test_site/expected/diagrams/activity.png',
  'test_site/expected/diagrams/class.png',
  'test_site/expected/diagrams/component.png',
  'test_site/expected/diagrams/object.png',
  'test_site/expected/diagrams/sequence.png',
  'test_site/expected/diagrams/state.png',
  'test_site/expected/diagrams/usecase.png',
  'test_site/expected/sub_site/inline-output/inline-puml-image.png',
];

function verifyPlantumlFiles() {
  // eslint-disable-next-line no-console
  plantumlGeneratedFiles.forEach((fileName) => {
    if (fs.existsSync(fileName)) {
      // eslint-disable-next-line no-console
      console.log('Found file');
    }
  });
}

module.exports = {
  plantumlGeneratedFiles,
  verifyPlantumlFiles,
};
