/**
 * @fileoverview TypeScript type definitions for Pagefind search results.
 * These types mirror the Pagefind JavaScript API response structure.
 * @see https://pagefind.app/docs/api-reference
 */

/**
 * Information about a matching word on a page.
 *
 * The `weight` field indicates the importance of this match based on:
 * - Default heading weights (h1=7.0, h2=6.0, ..., h6=2.0)
 * - Custom weights via `data-pagefind-weight` attribute
 *
 * The `balanced_score` is Pagefind's internal relevance calculation,
 * which can be used for custom ranking beyond Pagefind's default.
 *
 * @see https://pagefind.app/docs/ranking/
 * @see https://pagefind.app/docs/weighting/
 */
export interface PagefindWordLocation {
  /** The weight this word was originally tagged as (from heading level or data-pagefind-weight) */
  weight: number;
  /** Internal score calculated by Pagefind for this word - use for custom ranking */
  balanced_score: number;
  /** The index of this word in the result content (character position) */
  location: number;
}

/**
 * Raw data about elements with IDs that Pagefind encountered when indexing the page.
 * These are used to construct hierarchical titles (breadcrumbs) for sub-results.
 *
 * @see https://pagefind.app/docs/sub-results/
 */
export interface PagefindSearchAnchor {
  /** The HTML element type (e.g., 'h1', 'h2', 'div') */
  element: string;
  /** The value of the id attribute */
  id: string;
  /** The text content of the element */
  text: string;
  /** Position of this anchor in the result content */
  location: number;
}

/**
 * Metadata fields associated with a page.
 * These can be set during indexing via frontmatter or `data-pagefind-meta` attributes.
 *
 * @see https://pagefind.app/docs/metadata/
 * @see https://pagefind.app/docs/js-api-metadata/
 */
export type PagefindMeta = Record<string, string>;

/**
 * Represents a sub-result within a page - typically a heading/section that matches the search query.
 * Pagefind automatically detects headings with IDs and returns them as sub-results.
 *
 * @see https://pagefind.app/docs/sub-results/
 */
export interface PagefindSubResult {
  /** Title of this sub-result (derived from heading content) */
  title: string;
  /** URL to this specific section (page URL + heading hash) */
  url: string;
  /** The anchor element associated with this sub-result */
  anchor: PagefindSearchAnchor;
  /** Match locations with weight information for this specific segment */
  weighted_locations: PagefindWordLocation[];
  /** All locations where search terms match in this segment */
  locations: number[];
  /** Excerpt with `<mark>` tags highlighting the matching terms */
  excerpt: string;
}

/**
 * The complete raw result from a Pagefind search query.
 * This is returned when calling `result.data()` on a search result.
 *
 * @see https://pagefind.app/docs/api-reference
 * @see https://pagefind.app/docs/api/
 */
export interface PagefindSearchFragment {
  /** Processed URL for this page (includes baseUrl if configured) */
  url: string;
  /** Full text content of the page */
  content: string;
  /** Total word count on the page */
  word_count: number;
  /** Filter keys and values this page was tagged with */
  filters: Record<string, unknown>;
  /** Metadata fields for this page */
  meta: PagefindMeta;
  /** All anchor elements (headings with IDs) found on the page */
  anchors: PagefindSearchAnchor[];
  /**
   * All matching word locations with their weights and relevance scores.
   * This is the key data for understanding how Pagefind ranked this result.
   * @see https://pagefind.app/docs/ranking/
   */
  weighted_locations: PagefindWordLocation[];
  /** All locations where search terms match on this page */
  locations: number[];
  /** Raw unprocessed content */
  raw_content: string;
  /** Original URL before processing */
  raw_url: string;
  /** Processed excerpt with `<mark>` tags highlighting matching terms */
  excerpt: string;
  /** Sub-results (headings/sections) that contain matching terms */
  sub_results: PagefindSubResult[];
}

/**
 * Formatted search result ready for display in the UI.
 * This is the output of the formatting utilities in searchUtils.ts.
 */
export interface FormattedSearchResult {
  /** The URL to navigate to when selected */
  route: string;
  /** Processed metadata for display */
  meta: {
    /** Optional date for sorting/display */
    date?: number;
    /** Display title (may include hierarchical breadcrumbs) */
    title: string;
    /** Excerpt with highlighted terms */
    description: string;
    /** Additional metadata properties */
    [key: string]: unknown;
  };
  /** Reference to the original raw Pagefind result */
  result: PagefindSearchFragment;
  /** Whether this result is a sub-result (heading within a page) vs main result (full page) */
  isSubResult: boolean;
  /** Whether this is the last sub-result before a new main result (used for icon styling) */
  isLastSubResult: boolean;
}
