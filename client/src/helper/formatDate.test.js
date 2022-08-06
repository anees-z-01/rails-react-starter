import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats ISO timestamps as a short UTC date', () => {
    expect(formatDate('2022-08-06T23:30:00Z')).toBe('6 Aug 2022');
  });

  it('handles invalid values', () => {
    expect(formatDate('not-a-date')).toBe('Unknown date');
    expect(formatDate(undefined)).toBe('Unknown date');
  });
});
