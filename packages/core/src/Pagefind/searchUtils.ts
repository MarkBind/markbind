/**
 * @fileoverview Search result formatting utilities for Pagefind.
 * These functions transform raw Pagefind API responses into display-ready format.
 * @see https://pagefind.app/docs/api/
 */

import { isNumber } from 'lodash';
import type {
  PagefindSearchFragment, PagefindSubResult, PagefindSearchAnchor, FormattedSearchResult,
} from './types.js';

/**
 * Parses a single sub-result (heading/section) within a page into a display-ready format.
 *
 * This function constructs a hierarchical title (breadcrumb) by finding all anchor elements
 * that appear before the current sub-result. For example, if the page has:
 * - h1: "Installation"
 *   - h2: "Windows"
 *     - h3: "Troubleshooting"
 *
 * And the sub-result is "Troubleshooting", the title becomes "Installation > Windows > Troubleshooting".
 *
 * @param sub - The sub-result from Pagefind
 * @param anchors - All anchor elements on the page
 * @param result - The parent Pagefind result
 * @returns Formatted search result with hierarchical title
 * @see https://pagefind.app/docs/sub-results/
 */
function parseSubResult(
  sub: PagefindSubResult,
  anchors: PagefindSearchAnchor[],
  result: PagefindSearchFragment,
): FormattedSearchResult {
  const route = sub?.url || result?.url;
  const description = sub?.excerpt || result?.excerpt;
  const title = sub.title || '';

  return {
    route,
    meta: {
      ...result.meta,
      title,
      description,
    },
    result,
    isSubResult: true,
    isLastSubResult: false,
  };
}

/**
 * Formats raw Pagefind search results for display in the UI.
 *
 * This function performs four key transformations:
 *
 * 1. **Sort by Weight**: Sorts weighted_locations by their weight (descending),
 *    then by position (ascending) as a tie-breaker. This prioritizes matches
 *    in higher-weighted sections (e.g., headings) over body text.
 *
 * 2. **Pick Top Sub-Results**: Iterates through sorted locations and finds
 *    which sub-results (headings) contain those locations. If multiple
 *    sub-results contain the same location, keeps the one with more context
 *    (more locations). Stops after collecting `count` results.
 *
 * 3. **Re-sort by Document Order**: Resorts the selected sub-results by their
 *    position in the document, so they appear in natural reading order.
 *
 * 4. **Deduplicate**: Removes duplicate titles that may arise from overlapping matches.
 *
 * @param result - Raw Pagefind result from `pagefind.search().results[i].data()`
 * @param count - Maximum number of sub-results to return per page (default: 1)
 * @returns Array of formatted results ready for display
 * @see https://pagefind.app/docs/api-reference
 * @see https://pagefind.app/docs/ranking/
 * @see https://pagefind.app/docs/sub-results/
 *
 * @example
 * ```typescript
 * const search = await pagefind.search("installation");
 * const results = await Promise.all(search.results.map(r => r.data()));
 * const formatted = results.flatMap(r => formatPagefindResult(r, 2));
 * // Returns up to 2 sub-results per page, sorted by relevance
 * ```
 */
export function formatPagefindResult(
  result: PagefindSearchFragment,
  count = 10,
): FormattedSearchResult[] {
  const { sub_results: subResults, anchors, weighted_locations: weightedLocations } = result;

  // If no sub_results, return the main result as a non-sub-result
  if (!subResults || subResults.length === 0) {
    return [
      {
        route: result.url,
        meta: {
          ...result.meta,
          title: result.meta.title || '',
          description: result.excerpt || '',
        },
        result,
        isSubResult: false,
        isLastSubResult: false,
      },
    ];
  }

  // Sort weighted_locations by weight (descending).
  const sortedLocations = [...weightedLocations].sort((a, b) => {
    if (b.weight === a.weight) {
      // If equal weight -> earlier position in document comes first.
      return a.location - b.location;
    }
    return b.weight - a.weight;
  });

  // Pick top `count` sub-results based on weighted locations.
  const subs: PagefindSubResult[] = [];
  sortedLocations.forEach(({ location }) => {
    if (subs.length >= count) return;

    // Find sub-results that contain this weighted location
    const filterData = subResults.filter((sub: PagefindSubResult) => {
      const { locations } = sub;
      const [min] = locations || [];
      if (!isNumber(min)) return false;
      const max = locations.length === 1 ? Number.POSITIVE_INFINITY : locations[locations.length - 1];
      return min <= location && location <= max;
    });

    // Keep the sub-result with the most locations (most context)
    const sub = filterData.reduce<PagefindSubResult | null>((prev, curr) => {
      if (!prev) return curr;
      return prev.locations.length > curr.locations.length ? prev : curr;
    }, null);

    if (sub) subs.push(sub);
  });

  // Re-sort by document order (position in page).
  subs.sort((a, b) => {
    const [minA] = a.locations || [];
    const [minB] = b.locations || [];
    if (!minA || !minB) {
      return 0;
    }
    return minA - minB;
  });

  // Remove duplicate entries that may occur from overlapping matches.
  const filterMap = new Map<string, FormattedSearchResult>();
  const formattedSubResults = subs
    .map((sub: PagefindSubResult) => parseSubResult(sub, anchors, result))
    .filter((v: FormattedSearchResult) => {
      if (filterMap.has(v.meta.title)) {
        return false;
      }
      filterMap.set(v.meta.title, v);
      return true;
    });

  // Mark the last sub-result
  formattedSubResults.forEach((sub, index) => {
    // eslint-disable-next-line no-param-reassign
    sub.isLastSubResult = index === formattedSubResults.length - 1;
  });

  // Return main result first, then sub-results
  const mainResult = [
    {
      route: result.url,
      meta: {
        ...result.meta,
        title: result.meta.title || '',
        description: result.excerpt || '',
      },
      result,
      isSubResult: false,
      isLastSubResult: false,
    },
  ];

  return [...mainResult, ...formattedSubResults];
}
