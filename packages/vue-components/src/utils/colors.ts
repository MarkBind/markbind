export const BADGE_COLOURS: string[] = [
  'bg-primary',
  'bg-secondary',
  'bg-success',
  'bg-danger',
  'bg-warning text-dark',
  'bg-info text-dark',
  'bg-light text-dark',
  'bg-dark',
];

export const MIN_TAGS_FOR_SELECT_ALL: number = 3;

export function isBootstrapColor(color: string): boolean {
  return BADGE_COLOURS.some(c => c === color);
}

export function getTextColor(backgroundColor: string | null | undefined): string {
  if (!backgroundColor || backgroundColor.startsWith('bg-')) {
    return '#000';
  }
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
}

// Helper function to normalize color value
export const normalizeColor = (color: string | null | undefined): string | null => {
  if (!color) return null;

  // If it's a hex color, return as-is
  if (color.startsWith('#')) {
    return color;
  }

  // Check if it's a Bootstrap color name (without bg- prefix)
  const bootstrapColorNames: string[] = [
    'primary', 'secondary', 'success', 'danger',
    'warning', 'info', 'light', 'dark',
  ];
  const lowerColor = color.toLowerCase();

  if (bootstrapColorNames.includes(lowerColor)) {
    // Add bg- prefix and handle special cases for text color
    if (lowerColor === 'warning' || lowerColor === 'info' || lowerColor === 'light') {
      return `bg-${lowerColor} text-dark`;
    }
    return `bg-${lowerColor}`;
  }

  // If it already has bg- prefix, assume it's a valid Bootstrap class
  if (color.startsWith('bg-')) {
    return color;
  }

  // Otherwise, treat it as a hex color (for future flexibility)
  return color;
};
