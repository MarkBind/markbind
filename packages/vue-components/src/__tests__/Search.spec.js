import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import constant from 'lodash/constant';
import Search from '../pagefindSearchBar/Search.vue';

describe('Search', () => {
  let wrapper;
  let mockPagefindUI;
  let mockContainer;

  beforeEach(() => {
    mockContainer = {
      querySelectorAll: jest.fn(() => []),
      querySelector: jest.fn(constant(null)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    mockPagefindUI = jest.fn(() => ({}));
    window.PagefindUI = mockPagefindUI;
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    window.MutationObserver = jest.fn(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));

    document.querySelector = jest.fn((selector) => {
      if (selector === '#pagefind-search-input') {
        return mockContainer;
      }
      if (selector === '#pagefind-search-input input') {
        return { focus: jest.fn() };
      }
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    document.body.innerHTML = '';
  });

  test('renders search button', async () => {
    wrapper = mount(Search);
    await nextTick();

    const searchBtn = wrapper.find('.nav-search-btn-wait');
    expect(searchBtn.exists()).toBe(true);
    expect(wrapper.text()).toContain('Search');
  });

  test('displays correct metaKey for Mac', async () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    wrapper = mount(Search);
    await nextTick();

    expect(wrapper.find('.metaKey').text()).toBe('⌘ K');
  });

  test('displays correct metaKey for non-Mac', async () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    });

    wrapper = mount(Search);
    await nextTick();

    expect(wrapper.find('.metaKey').text()).toBe('Ctrl K');
  });

  test('opens modal on button click', async () => {
    wrapper = mount(Search);
    await nextTick();

    await wrapper.find('.nav-search-btn-wait').trigger('click');
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(true);
  });

  test('opens modal on Cmd+K keyboard shortcut', async () => {
    wrapper = mount(Search);
    await nextTick();

    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    window.addEventListener.mock.calls[0][1](event);
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(true);
  });

  test('opens modal on Ctrl+K keyboard shortcut', async () => {
    wrapper = mount(Search);
    await nextTick();

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    window.addEventListener.mock.calls[0][1](event);
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(true);
  });

  test('closes modal on Escape key', async () => {
    wrapper = mount(Search);
    await nextTick();

    await wrapper.find('.nav-search-btn-wait').trigger('click');
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(true);

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    window.addEventListener.mock.calls[0][1](escapeEvent);
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(false);
  });

  test('closes modal on backdrop click', async () => {
    wrapper = mount(Search, { attachTo: document.body });
    await nextTick();

    await wrapper.find('.nav-search-btn-wait').trigger('click');
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(true);
    expect(wrapper.find('[command-dialog-mask]').exists()).toBe(true);

    await wrapper.find('[command-dialog-mask]').trigger('click.self');
    await nextTick();

    expect(wrapper.find('.algolia').exists()).toBe(false);
  });

  test('initializes PagefindUI when modal opens', async () => {
    wrapper = mount(Search);
    await nextTick();

    await wrapper.find('.nav-search-btn-wait').trigger('click');
    await nextTick();
    await nextTick();

    expect(mockPagefindUI).toHaveBeenCalled();
  });

  test('adds keydown event listener on mount', async () => {
    wrapper = mount(Search);
    await nextTick();

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('removes keydown event listener on unmount', async () => {
    wrapper = mount(Search);
    await nextTick();

    wrapper.unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
