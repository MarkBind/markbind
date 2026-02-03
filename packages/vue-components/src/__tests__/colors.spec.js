import {
  BADGE_COLOURS,
  MIN_TAGS_FOR_SELECT_ALL,
  isBootstrapColor,
  getTextColor,
  normalizeColor,
} from '../utils/colors';

describe('colors.js', () => {
  describe('isBootstrapColor', () => {
    it('should return true for valid Bootstrap color classes', () => {
      expect(isBootstrapColor('bg-primary')).toBe(true);
      expect(isBootstrapColor('bg-secondary')).toBe(true);
      expect(isBootstrapColor('bg-success')).toBe(true);
      expect(isBootstrapColor('bg-danger')).toBe(true);
      expect(isBootstrapColor('bg-warning text-dark')).toBe(true);
      expect(isBootstrapColor('bg-info text-dark')).toBe(true);
      expect(isBootstrapColor('bg-light text-dark')).toBe(true);
      expect(isBootstrapColor('bg-dark')).toBe(true);
    });

    it('should return false for hex colors', () => {
      expect(isBootstrapColor('#28a745')).toBe(false);
      expect(isBootstrapColor('#dc3545')).toBe(false);
      expect(isBootstrapColor('#ffffff')).toBe(false);
    });

    it('should return false for invalid color values', () => {
      expect(isBootstrapColor('custom-color')).toBe(false);
      expect(isBootstrapColor('bg-custom')).toBe(false);
      expect(isBootstrapColor('')).toBe(false);
    });
  });

  describe('getTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(getTextColor('#ffffff')).toBe('#000');
      expect(getTextColor('#f0f0f0')).toBe('#000');
      expect(getTextColor('#ffc107')).toBe('#000'); // warning yellow
    });

    it('should return white for dark backgrounds', () => {
      expect(getTextColor('#000000')).toBe('#fff');
      expect(getTextColor('#333333')).toBe('#fff');
      expect(getTextColor('#dc3545')).toBe('#fff'); // danger red
      expect(getTextColor('#28a745')).toBe('#fff'); // success green
      expect(getTextColor('#17a2b8')).toBe('#fff'); // info cyan
    });

    it('should return black for Bootstrap color classes', () => {
      expect(getTextColor('bg-primary')).toBe('#000');
      expect(getTextColor('bg-warning text-dark')).toBe('#000');
    });

    it('should handle edge cases', () => {
      expect(getTextColor('')).toBe('#000');
      expect(getTextColor(null)).toBe('#000');
      expect(getTextColor(undefined)).toBe('#000');
    });

    it('should handle colors without # prefix', () => {
      expect(getTextColor('ffffff')).toBe('#000');
      expect(getTextColor('000000')).toBe('#fff');
    });
  });

  describe('normalizeColor', () => {
    it('should return null for empty or undefined values', () => {
      expect(normalizeColor(null)).toBe(null);
      expect(normalizeColor(undefined)).toBe(null);
      expect(normalizeColor('')).toBe(null);
    });

    it('should return hex colors as-is', () => {
      expect(normalizeColor('#28a745')).toBe('#28a745');
      expect(normalizeColor('#dc3545')).toBe('#dc3545');
      expect(normalizeColor('#ffffff')).toBe('#ffffff');
    });

    it('should convert Bootstrap color names to classes', () => {
      expect(normalizeColor('primary')).toBe('bg-primary');
      expect(normalizeColor('secondary')).toBe('bg-secondary');
      expect(normalizeColor('success')).toBe('bg-success');
      expect(normalizeColor('danger')).toBe('bg-danger');
      expect(normalizeColor('dark')).toBe('bg-dark');
    });

    it('should add text-dark for light Bootstrap colors', () => {
      expect(normalizeColor('warning')).toBe('bg-warning text-dark');
      expect(normalizeColor('info')).toBe('bg-info text-dark');
      expect(normalizeColor('light')).toBe('bg-light text-dark');
    });

    it('should handle case-insensitive Bootstrap color names', () => {
      expect(normalizeColor('PRIMARY')).toBe('bg-primary');
      expect(normalizeColor('Success')).toBe('bg-success');
      expect(normalizeColor('DANGER')).toBe('bg-danger');
      expect(normalizeColor('Warning')).toBe('bg-warning text-dark');
    });

    it('should return colors with bg- prefix as-is', () => {
      expect(normalizeColor('bg-primary')).toBe('bg-primary');
      expect(normalizeColor('bg-custom')).toBe('bg-custom');
      expect(normalizeColor('bg-warning text-dark')).toBe('bg-warning text-dark');
    });

    it('should treat unknown color names as custom colors', () => {
      expect(normalizeColor('custom')).toBe('custom');
      expect(normalizeColor('my-color')).toBe('my-color');
    });
  });

  describe('BADGE_COLOURS constant', () => {
    it('should contain all 8 Bootstrap color variants', () => {
      expect(BADGE_COLOURS).toHaveLength(8);
      expect(BADGE_COLOURS).toContain('bg-primary');
      expect(BADGE_COLOURS).toContain('bg-secondary');
      expect(BADGE_COLOURS).toContain('bg-success');
      expect(BADGE_COLOURS).toContain('bg-danger');
      expect(BADGE_COLOURS).toContain('bg-warning text-dark');
      expect(BADGE_COLOURS).toContain('bg-info text-dark');
      expect(BADGE_COLOURS).toContain('bg-light text-dark');
      expect(BADGE_COLOURS).toContain('bg-dark');
    });
  });

  describe('MIN_TAGS_FOR_SELECT_ALL constant', () => {
    it('should be set to 3', () => {
      expect(MIN_TAGS_FOR_SELECT_ALL).toBe(3);
    });
  });
});
