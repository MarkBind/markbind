module.exports.COLLECT_PLUGIN_SOURCES = `
<custom-tag-one src="images/sample1.png">
  Lorem ipsum dolor sit amet, Ut enim ad minim veniam, 
  <div data-included-from="/root/subdir/includedpage.md">
    consectetur adipiscing elit, 
    <div>
      <custom-tag-two srcattr="images/sample2.png">
        sed do eiusmod tempor incididunt ut labore
        <div data-included-from="/root/subdir2/includedpage.md">
          <custom-tag-two srcattr="sample3.png">
            et dolore
          </custom-tag-two>
          <custom-tag-two incorrectattr="should/not/be/returned.png">
             magna aliqua.
          </custom-tag-two>
        </div>
      </custom-tag-two>
    </div>
  </div>
  quis nostrud exercitation ut
  <custom-tag-two srcattr="images/sample4.png">Lorem ipsum</custom-tag-two>
  <!-- urls should not be included -->
  <custom-tag-one src="https://www.google.com">ullamco laboris nisi </custom-tag-one>
  <custom-tag-one src="/absolute/paths/should/not/be/rewritten.png">
    aliquip ex ea commodo consequat.
  </custom-tag-one>
</custom-tag-one>`;

module.exports.COLLECT_PLUGIN_TEST_PLUGIN = {
  getSources: () => ({
    tagMap: [['custom-tag-one', 'src'], ['custom-tag-two', 'srcattr']],
    sources: [
      'paths/here/should/be/resolved/relative/to/processed/page.cpp',
      '/except/absolute/sources.c',
    ],
  }),
};
