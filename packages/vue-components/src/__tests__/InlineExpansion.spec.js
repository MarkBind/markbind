import { mount } from '@vue/test-utils';
import InlineExpansion from '../InlineExpansion.vue';

const defaultProps = {
  expandedText: 'This is a very long piece of text.',
  collapsedText: 'Short version',
  maxChars: 20,
};

describe('InlineExpansion.vue', () => {
  it('uses provided collapsedText when available', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: defaultProps,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('Short version');
  });

  it('displays truncated collapsedText if it exceeds maxChars', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        expandedText: 'This is a custom expanded text.',
        collapsedText: 'This is a custom collapsed text',
        maxChars: 20,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('This is a custom ...');
  });

  it('falls back to expandedText if collapsedText is not provided', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        expandedText: 'This is a very long piece of text.',
        collapsedText: undefined,
        maxChars: 20,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('This is a very lo...');
  });

  it('displays truncated collapsedText if it exceeds maxChars and expandedText is missing', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        collapsedText: 'This is a very long piece of text that exceeds maxChars',
        maxChars: 20,
        expandedText: undefined,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('This is a very lo...');
  });

  it('displays collapsedText truncated to maxChars when expandedText is provided', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        collapsedText: 'This is a very long piece of text that exceeds maxChars',
        maxChars: 20,
        expandedText: 'This is the expanded version of the text',
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('This is a very lo...');
  });

  it('handles missing expandedText gracefully', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        expandedText: undefined,
        collapsedText: 'Short version',
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('Short version');
  });

  it('handles missing expandedText and collapsedText gracefully', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        expandedText: undefined,
        collapsedText: undefined,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button.inline-panel').text()).toBe('');
  });

  // Test for Button Toggle
  it('toggles between collapsed and expanded text when button is clicked', async () => {
    const wrapper = mount(InlineExpansion, {
      propsData: {
        collapsedText: 'This is some collapsed text.',
        expandedText: 'This is the expanded text.',
        maxChars: 20,
      },
    });

    // Initially, we expect the collapsed text to be shown
    expect(wrapper.find('button.inline-panel').text()).toBe('This is some coll...');

    // Simulate clicking the button to expand the text
    await wrapper.find('button.inline-panel').trigger('click');

    // Now we expect the expanded text to be shown
    expect(wrapper.find('button.inline-panel').text()).toBe('This is the expanded text.');

    // Simulate clicking the button to collapse the text again
    await wrapper.find('button.inline-panel').trigger('click');

    // Expect the collapsed text to show again
    expect(wrapper.find('button.inline-panel').text()).toBe('This is some coll...');
  });
});
