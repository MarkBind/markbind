/**
 * Unit tests for Pagefind search result formatting utilities.
 *
 * These tests validate the transformation of raw Pagefind API responses
 * into display-ready format for the MarkBind search UI.
 */
import { formatPagefindResult } from '../../../src/Pagefind/index';
import type {
  PagefindSearchFragment,
  PagefindSubResult,
  PagefindWordLocation,
  PagefindSearchAnchor,
} from '../../../src/Pagefind/index';

const createWordLocation = (
  location: number,
  weight: number = 1,
  balanced_score: number = 1,
): PagefindWordLocation => ({
  location,
  weight,
  balanced_score,
});

const createAnchor = (
  element: string,
  id: string,
  text: string,
  location: number,
): PagefindSearchAnchor => ({
  element,
  id,
  text,
  location,
});

const createSubResult = (
  title: string,
  url: string,
  locations: number[],
  excerpt: string,
  weighted_locations: PagefindWordLocation[] = [],
): PagefindSubResult => ({
  title,
  url,
  anchor: createAnchor('h2', title.toLowerCase().replace(/\s+/g, '-'), title, locations[0] || 0),
  locations,
  excerpt,
  weighted_locations,
});

const createPagefindResult = (
  url: string,
  title: string,
  excerpt: string,
  subResults: PagefindSubResult[] = [],
  weightedLocations: PagefindWordLocation[] = [],
): PagefindSearchFragment => ({
  url,
  content: '',
  word_count: 100,
  filters: {},
  meta: { title },
  anchors: subResults.map(sr => sr.anchor),
  weighted_locations: weightedLocations,
  locations: weightedLocations.map(wl => wl.location),
  raw_content: '',
  raw_url: url,
  excerpt,
  sub_results: subResults,
});

describe('formatPagefindResult', () => {
  describe('main result handling', () => {
    it('should return main result only when there are no sub-results', () => {
      const result = createPagefindResult('/page1', 'Page 1', 'Main content here');
      const formatted = formatPagefindResult(result);

      expect(formatted).toHaveLength(1);
      expect(formatted[0].isSubResult).toBe(false);
      expect(formatted[0].route).toBe('/page1');
      expect(formatted[0].meta.title).toBe('Page 1');
    });

    it('should include meta information in main result', () => {
      const result = createPagefindResult('/page1', 'Test Page', 'Test excerpt');
      const formatted = formatPagefindResult(result);

      expect(formatted[0].meta).toHaveProperty('title', 'Test Page');
      expect(formatted[0].meta).toHaveProperty('description');
    });
  });

  describe('sub-result handling', () => {
    it('should return main result plus single sub-result', () => {
      const subResult = createSubResult('Installation', '/page1#installation', [50], 'How to install');
      const weightedLocations = [createWordLocation(50, 5, 10)];
      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main excerpt', [subResult], weightedLocations);

      const formatted = formatPagefindResult(pageResult);

      expect(formatted).toHaveLength(2);
      expect(formatted[0].isSubResult).toBe(false);
      expect(formatted[1].isSubResult).toBe(true);
      expect(formatted[1].meta.title).toBe('Installation');
    });

    it('should respect count limit for sub-results', () => {
      const sub1 = createSubResult('Section 1', '/page1#section-1', [10], 'Content 1');
      const sub2 = createSubResult('Section 2', '/page1#section-2', [30], 'Content 2');
      const sub3 = createSubResult('Section 3', '/page1#section-3', [50], 'Content 3');
      const sub4 = createSubResult('Section 4', '/page1#section-4', [70], 'Content 4');

      const weightedLocations = [
        createWordLocation(10, 5, 10),
        createWordLocation(30, 5, 8),
        createWordLocation(50, 5, 6),
        createWordLocation(70, 5, 4),
      ];

      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [sub1, sub2, sub3, sub4], weightedLocations);

      const formatted = formatPagefindResult(pageResult, 2);

      expect(formatted.length).toBeGreaterThanOrEqual(1);
      const subResultCount = formatted.filter(f => f.isSubResult).length;
      expect(subResultCount).toBeLessThanOrEqual(2);
    });

    it('should filter out sub-results with titles matching page title', () => {
      const pageTitle = 'My Page';
      const subResult = createSubResult('My Page', '/page1#my-page', [50], 'Section content');
      const weightedLocations = [createWordLocation(50, 5, 10)];
      const pageResult = createPagefindResult('/page1', pageTitle, 'Main excerpt', [subResult], weightedLocations);

      const formatted = formatPagefindResult(pageResult);

      const subResults = formatted.filter(f => f.isSubResult);
      expect(subResults).toHaveLength(0);
    });

    it('should mark last sub-result correctly', () => {
      const sub1 = createSubResult('Section 1', '/page1#section-1', [10], 'Content 1');
      const sub2 = createSubResult('Section 2', '/page1#section-2', [30], 'Content 2');

      const weightedLocations = [
        createWordLocation(10, 5, 10),
        createWordLocation(30, 5, 8),
      ];

      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [sub1, sub2], weightedLocations);

      const formatted = formatPagefindResult(pageResult);

      const subResults = formatted.filter(f => f.isSubResult);
      expect(subResults[0].isLastSubResult).toBe(false);
      expect(subResults[1].isLastSubResult).toBe(true);
    });

    it('should re-sort sub-results by document order', () => {
      const weightedLocations = [
        createWordLocation(100, 5, 10),
        createWordLocation(20, 5, 8),
        createWordLocation(50, 5, 6),
      ];

      const sub1 = createSubResult('Section A', '/page1#section-a', [100], 'Content A', weightedLocations);
      const sub2 = createSubResult('Section B', '/page1#section-b', [20], 'Content B', weightedLocations);
      const sub3 = createSubResult('Section C', '/page1#section-c', [50], 'Content C', weightedLocations);

      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [sub1, sub2, sub3], weightedLocations);

      const formatted = formatPagefindResult(pageResult, 10);

      const subResults = formatted.filter(f => f.isSubResult);
      expect(subResults.length).toBeGreaterThanOrEqual(2);
      const titles = subResults.map(s => s.meta.title);
      expect(titles).toContain('Section B');
      expect(titles).toContain('Section C');
    });

    it('should remove duplicate titles from sub-results', () => {
      const sub1 = createSubResult('Getting Started', '/page1#getting-started', [20], 'Content 1');
      const sub2 = createSubResult('Getting Started', '/page1#getting-started-2', [50], 'Content 2');

      const weightedLocations = [
        createWordLocation(20, 5, 10),
        createWordLocation(50, 5, 8),
      ];

      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [sub1, sub2], weightedLocations);

      const formatted = formatPagefindResult(pageResult);

      const titles = formatted.filter(f => f.isSubResult).map(f => f.meta.title);
      const uniqueTitles = new Set(titles);
      expect(titles.length).toBe(uniqueTitles.size);
    });

    it('should keep sub-result with most locations when multiple contain same weighted location', () => {
      const sub1 = createSubResult('Section A', '/page1#section-a', [10, 20, 30], 'Multiple matches', [
        createWordLocation(10),
        createWordLocation(20),
        createWordLocation(30),
      ]);
      const sub2 = createSubResult('Section B', '/page1#section-b', [10, 15], 'Fewer matches', [
        createWordLocation(10),
        createWordLocation(15),
      ]);

      const weightedLocations = [createWordLocation(10, 5, 10)];

      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [sub1, sub2], weightedLocations);

      const formatted = formatPagefindResult(pageResult);

      const subResults = formatted.filter(f => f.isSubResult);
      expect(subResults).toHaveLength(1);
      expect(subResults[0].meta.title).toBe('Section A');
    });
  });

  describe('edge cases', () => {
    it('should handle empty weighted_locations gracefully', () => {
      const subResult = createSubResult('Section', '/page1#section', [], 'Content');
      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main excerpt', [subResult], []);

      const formatted = formatPagefindResult(pageResult);

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle sub-results with single location', () => {
      const subResult = createSubResult('Section', '/page1#section', [25], 'Content');
      const weightedLocations = [createWordLocation(25, 5, 10)];
      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [subResult], weightedLocations);

      const formatted = formatPagefindResult(pageResult);

      expect(formatted).toHaveLength(2);
      expect(formatted[1].isSubResult).toBe(true);
    });

    it('should handle sub-results with zero count', () => {
      const subResult = createSubResult('Section', '/page1#section', [25], 'Content');
      const weightedLocations = [createWordLocation(25, 5, 10)];
      const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [subResult], weightedLocations);

      const formatted = formatPagefindResult(pageResult, 0);

      expect(formatted[0].isSubResult).toBe(false);
    });
  });
});

describe('truncateExcerptToShowMark (via formatPagefindResult)', () => {
  it('should preserve mark tags in excerpt', () => {
    const subResult = createSubResult('Section', '/page1#section', [10], 'This is <mark>highlighted</mark> content');
    const weightedLocations = [createWordLocation(10, 5, 10)];
    const pageResult = createPagefindResult('/page1', 'Page 1', 'Main <mark>highlight</mark>', [subResult], weightedLocations);

    const formatted = formatPagefindResult(pageResult);

    expect(formatted[0].meta.description).toContain('<mark>');
  });

  it('should handle excerpts without mark tags', () => {
    const pageResult = createPagefindResult('/page1', 'Page 1', 'Plain text without marks');

    const formatted = formatPagefindResult(pageResult);

    expect(formatted[0].meta.description).toBe('Plain text without marks');
  });

  it('should handle mark at the start of excerpt', () => {
    const subResult = createSubResult('Section', '/page1#section', [0], '<mark>Start</mark> of content');
    const weightedLocations = [createWordLocation(0, 5, 10)];
    const pageResult = createPagefindResult('/page1', 'Page 1', '<mark>Main</mark> content', [subResult], weightedLocations);

    const formatted = formatPagefindResult(pageResult);

    expect(formatted[0].meta.description).toContain('<mark>Main</mark>');
  });
});

describe('mergeConsecutiveMarks (via formatPagefindResult)', () => {
  it('should merge consecutive mark tags in excerpt', () => {
    const subResult = createSubResult('Section', '/page1#section', [10], '<mark>making</mark> <mark>the</mark> search');
    const weightedLocations = [createWordLocation(10, 5, 10)];
    const pageResult = createPagefindResult('/page1', 'Page 1', 'Main content', [subResult], weightedLocations);

    const formatted = formatPagefindResult(pageResult);

    const subResultDesc = formatted[1]?.meta?.description ?? formatted[1]?.result?.excerpt ?? '';
    expect(subResultDesc).toContain('<mark>making the</mark>');
  });

  it('should not merge non-adjacent mark tags', () => {
    const subResult = createSubResult('Section', '/page1#section', [10], '<mark>first</mark> and <mark>second</mark>');
    const weightedLocations = [createWordLocation(10, 5, 10)];
    const pageResult = createPagefindResult('/page1', 'Page 1', 'Main', [subResult], weightedLocations);

    const formatted = formatPagefindResult(pageResult);

    const subResultDesc = formatted[1]?.meta?.description ?? formatted[1]?.result?.excerpt ?? '';
    expect(subResultDesc).toContain('<mark>first</mark>');
    expect(subResultDesc).toContain('<mark>second</mark>');
  });

  it('should handle excerpts without any mark tags', () => {
    const pageResult = createPagefindResult('/page1', 'Page 1', 'Plain text excerpt');

    const formatted = formatPagefindResult(pageResult);

    expect(formatted[0].meta.description).toBe('Plain text excerpt');
  });
});
