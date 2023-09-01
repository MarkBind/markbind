const testSites = [
  'test_site',
  'test_site_algolia_plugin',
  'test_site_special_tags',
];

const testConvertSites = [
  'test_site_convert/test_basic_convert',
  'test_site_convert/test_navigation_convert',
];

const testTemplateSites = [
  'minimal,test_site_templates/test_minimal',
  'default,test_site_templates/test_default',
];

const testOptimizeIconsSites = [
  'test_site_optimize_icons/test_with_icons',
  'test_site_optimize_icons/test_with_no_icons',
];

// These files will be generated within test_site/expected/
// after running `npm run updatetest`. Due to the fact that
// these files create git diffs every time they are generated,
// we decided to not commit them to the repository.
// However, we still want to verify that they are present.
const plantumlGeneratedFiles = [
  '9c9e77fc0a983cb6b592e65733787bec.png',
  'inline-output.png',
  'diagrams/activity.png',
  'diagrams/class.png',
  'diagrams/component.png',
  'diagrams/object.png',
  'diagrams/sequence.png',
  'diagrams/state.png',
  'diagrams/usecase.png',
  'sub_site/inline-output/inline-puml-image.png',
];

module.exports = {
  testSites,
  testConvertSites,
  testTemplateSites,
  testOptimizeIconsSites,
  plantumlGeneratedFiles,
};
