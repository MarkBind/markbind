import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Search from '../pagefindSearchBar/Search.vue';

describe('Search', () => {
  let wrapper;
  let mockPagefind;
  let mockSearchResults;
  let originalLocation;

  const createMockResult = (overrides = {}) => ({
    url: '/test-page',
    meta: {
      title: 'Test Page',
      description: 'Test description with <mark>match</mark>',
    },
    isSubResult: false,
    isLastSubResult: false,
    ...overrides,
  });

  const createMockSearchResult = (results = []) => ({
    results: results.map(r => ({
      data: jest.fn().mockResolvedValue(r),
    })),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    originalLocation = window.location;
    delete window.location;
    window.location = { href: '', assign: jest.fn() };

    mockSearchResults = [
      createMockResult({
        url: '/page1',
        meta: { title: 'Page 1', description: 'Content from page 1' },
      }),
      createMockResult({
        url: '/page1#section',
        meta: { title: 'Section', description: 'Content from section' },
        isSubResult: true,
        isLastSubResult: true,
      }),
    ];

    mockPagefind = {
      search: jest.fn().mockResolvedValue(createMockSearchResult(mockSearchResults)),
    };

    window.loadPagefind = jest.fn().mockResolvedValue(mockPagefind);
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();

    document.elementFromPoint = jest.fn().mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    document.body.innerHTML = '';
    delete window.loadPagefind;
    window.location = originalLocation;
  });

  describe('Component Rendering', () => {
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

      expect(wrapper.find('.metaKey').text()).toContain('⌘');
    });

    test('displays correct metaKey for Windows', async () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      wrapper = mount(Search);
      await nextTick();

      expect(wrapper.find('.metaKey').text()).toContain('Ctrl');
    });

    test('modal is hidden by default', async () => {
      wrapper = mount(Search);
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(false);
    });
  });

  describe('Modal Open/Close', () => {
    test('opens modal on button click', async () => {
      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(true);
      expect(wrapper.find('.search-modal').exists()).toBe(true);
    });

    test('opens modal on Cmd+K keyboard shortcut', async () => {
      wrapper = mount(Search);
      await nextTick();

      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
      window.addEventListener.mock.calls[0][1](event);
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(true);
    });

    test('opens modal on Ctrl+K keyboard shortcut', async () => {
      wrapper = mount(Search);
      await nextTick();

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      window.addEventListener.mock.calls[0][1](event);
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(true);
    });

    test('closes modal on backdrop click', async () => {
      wrapper = mount(Search, { attachTo: document.body });
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(true);

      await wrapper.find('[command-dialog-mask]').trigger('click.self');
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(false);
    });

    test('closes modal on Escape key', async () => {
      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(true);

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.addEventListener.mock.calls[0][1](escapeEvent);
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(false);
    });
  });

  describe('Search Functionality', () => {
    test('clears results on empty query', async () => {
      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      const input = wrapper.find('input.search-input');
      await input.setValue('');
      await nextTick();

      jest.advanceTimersByTime(200);
      await nextTick();

      expect(wrapper.find('.search-results').exists()).toBe(false);
    });

    test('handles search errors gracefully', async () => {
      window.loadPagefind = jest.fn().mockRejectedValue(new Error('Pagefind failed'));

      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      const input = wrapper.find('input.search-input');
      await input.setValue('test');
      await nextTick();

      jest.advanceTimersByTime(200);
      await nextTick();
      await nextTick();

      expect(wrapper.find('.search-empty').exists()).toBe(true);
    });

    test('debounces search input', async () => {
      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      const input = wrapper.find('input.search-input');

      await input.setValue('a');
      await nextTick();
      jest.advanceTimersByTime(50);
      await nextTick();

      await input.setValue('ab');
      await nextTick();
      jest.advanceTimersByTime(50);
      await nextTick();

      await input.setValue('abc');
      await nextTick();
      jest.advanceTimersByTime(50);
      await nextTick();

      expect(mockPagefind.search).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      await nextTick();

      expect(mockPagefind.search).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      mockPagefind.search = jest.fn().mockResolvedValue({
        results: [
          {
            data: jest.fn().mockResolvedValue({
              url: '/page1',
              meta: { title: 'Result 1', description: 'Description 1' },
              sub_results: [
                {
                  title: 'Section 1',
                  url: '/page1#section1',
                  locations: [10],
                  weighted_locations: [{ location: 10, weight: 1, balanced_score: 1 }],
                  excerpt: 'Section content',
                },
                {
                  title: 'Section 2',
                  url: '/page1#section2',
                  locations: [50],
                  weighted_locations: [{ location: 50, weight: 1, balanced_score: 1 }],
                  excerpt: 'Another section',
                },
              ],
              weighted_locations: [
                { location: 10, weight: 1, balanced_score: 1 },
                { location: 50, weight: 1, balanced_score: 1 },
              ],
              anchors: [],
              excerpt: 'Main content',
            }),
          },
        ],
      });

      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      const input = wrapper.find('input.search-input');
      await input.setValue('test');
      await nextTick();

      jest.advanceTimersByTime(200);
      await nextTick();
      await nextTick();
    });

    test('ArrowDown navigates to next result', async () => {
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      wrapper.find('input.search-input').element.dispatchEvent(downEvent);
      await nextTick();

      const items = wrapper.findAll('.search-result-item');
      expect(items[0].classes()).toContain('active');
    });

    test('ArrowDown at last item does not crash', async () => {
      const items = wrapper.findAll('.search-result-item');
      const lastIndex = items.length - 1;

      for (let i = 0; i <= lastIndex + 1; i += 1) {
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        wrapper.find('input.search-input').element.dispatchEvent(downEvent);
        // eslint-disable-next-line no-await-in-loop
        await nextTick();
      }

      expect(wrapper.find('.search-result-item').exists()).toBe(true);
    });

    test('ArrowUp at first item does not crash', async () => {
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      wrapper.find('input.search-input').element.dispatchEvent(upEvent);
      await nextTick();

      expect(wrapper.find('.search-result-item').exists()).toBe(true);
    });
  });

  describe('Result Interaction', () => {
    beforeEach(async () => {
      mockPagefind.search = jest.fn().mockResolvedValue({
        results: [
          {
            data: jest.fn().mockResolvedValue({
              url: '/page1',
              meta: { title: 'Main Page', description: 'Main description' },
              sub_results: [
                {
                  title: 'Section A',
                  url: '/page1#section-a',
                  locations: [10],
                  weighted_locations: [{ location: 10, weight: 1, balanced_score: 1 }],
                  excerpt: 'Section A content',
                },
              ],
              weighted_locations: [{ location: 10, weight: 1, balanced_score: 1 }],
              anchors: [],
              excerpt: 'Main content',
            }),
          },
        ],
      });

      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      const input = wrapper.find('input.search-input');
      await input.setValue('test');
      await nextTick();

      jest.advanceTimersByTime(200);
      await nextTick();
      await nextTick();
    });

    test('click on result navigates to URL', async () => {
      await wrapper.find('.search-result-item').trigger('click');
      await nextTick();

      expect(window.location.href).toBe('/page1');
    });

    test('mouse hover highlights result', async () => {
      await wrapper.findAll('.search-result-item')[0].trigger('mouseenter');
      await nextTick();

      expect(wrapper.find('.search-result-item').classes()).toContain('active');
    });

    test('renders main result with file icon', async () => {
      const mainResult = wrapper.findAll('.search-result-item')[0];
      expect(mainResult.find('.DocSearch-Hit-icon').exists()).toBe(true);
    });

    test('renders sub-result with tree icon', async () => {
      const subResult = wrapper.findAll('.search-result-item')[1];
      expect(subResult.find('.DocSearch-Hit-Tree').exists()).toBe(true);
    });

    test('result displays title and description', async () => {
      const resultItem = wrapper.find('.search-result-item');
      expect(resultItem.find('.result-title').exists()).toBe(true);
      expect(resultItem.find('.result-excerpt').exists()).toBe(true);
    });
  });

  describe('State Management', () => {
    test('modal close clears results', async () => {
      wrapper = mount(Search);
      await nextTick();

      await wrapper.find('.nav-search-btn-wait').trigger('click');
      await nextTick();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.addEventListener.mock.calls[0][1](escapeEvent);
      await nextTick();

      expect(wrapper.find('.search-dialog').exists()).toBe(false);
    });
  });

  describe('Cleanup', () => {
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
});
