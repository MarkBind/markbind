import closeable from '../directives/Closeable';

describe('Closeable directive', () => {
  test('preserves plain text content', () => {
    const element = document.createElement('div');
    element.textContent = 'Plain text';

    closeable.mounted(element);

    expect(element.querySelector('.content').textContent).toBe('Plain text');
  });
});
