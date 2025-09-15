import { ProgressBar } from '../../../../src/lib/progress/node-progress';

describe('ProgressBar', () => {
  let mockStream: any;

  beforeEach(() => {
    mockStream = {
      isTTY: true,
      columns: 80,
      write: jest.fn(),
      cursorTo: jest.fn(),
      clearLine: jest.fn(),
    };
  });

  test('constructor initializes correctly', () => {
    // Test number parameter
    const bar1 = new ProgressBar(':bar', 10);
    expect(bar1.total).toBe(10);
    expect(bar1.curr).toBe(0);

    // Test options object
    const bar2 = new ProgressBar(':bar', {
      total: 100,
      curr: 5,
      complete: '#',
      incomplete: '.',
      clear: true,
      renderThrottle: 100,
    });
    expect(bar2.total).toBe(100);
    expect(bar2.curr).toBe(5);
    expect(bar2.chars.complete).toBe('#');
    expect(bar2.chars.incomplete).toBe('.');
    expect(bar2.clear).toBe(true);
    expect(bar2.renderThrottle).toBe(100);
  });

  test('constructor throws on invalid input', () => {
    expect(() => new ProgressBar(123 as any, { total: 10 })).toThrow('format required');
    expect(() => new ProgressBar(':bar', {} as any)).toThrow('total required');
  });

  test('tick increments progress and handles completion', () => {
    const callback = jest.fn();
    const bar = new ProgressBar(':bar', { total: 5, stream: mockStream, callback });

    bar.tick(3);
    expect(bar.curr).toBe(3);

    bar.tick(1, { custom: 'token' });
    expect(bar.curr).toBe(4);
    expect(bar.tokens.custom).toBe('token');
    expect(callback).not.toHaveBeenCalled();

    bar.tick(1); // Complete
    expect(bar.curr).toBe(5);
    expect(bar.complete).toBe(true);
    expect(callback).toHaveBeenCalledWith(bar);
  });

  test('tick swaps tokens when first argument is object', () => {
    const bar = new ProgressBar(':bar :custom', { total: 10, stream: mockStream });
    bar.tick({ custom: 'tokenValue' });
    expect(bar.curr).toBe(1);
    expect(bar.tokens.custom).toBe('tokenValue');
    expect(bar.start).toBeInstanceOf(Date);
  });

  test('render handles tokens and force rendering', () => {
    const bar = new ProgressBar(':bar :current/:total :percent% :eta', {
      total: 100,
      stream: mockStream,
    });

    bar.tick(25);
    expect(mockStream.write).toHaveBeenCalled();
    const output = mockStream.write.mock.calls[0][0];
    expect(output).toContain('25/100');
    expect(output).toContain('25%');

    // Test force render with different progress
    mockStream.write.mockClear();
    bar.curr = 30;
    bar.render(undefined, true);
    expect(mockStream.write).toHaveBeenCalledTimes(1);
  });

  test('render handles TTY and custom tokens', () => {
    const bar = new ProgressBar(':bar :custom', { total: 10, stream: mockStream });
    bar.render({ custom: 'value' });
    expect(mockStream.write).toHaveBeenCalled();
    expect(mockStream.write.mock.calls[0][0]).toContain('value');

    // Test non-TTY
    mockStream.isTTY = false;
    mockStream.write.mockClear();
    bar.render();
    expect(mockStream.write).not.toHaveBeenCalled();
  });

  test('update sets progress by ratio', () => {
    const bar = new ProgressBar(':bar', { total: 10, stream: mockStream });

    bar.update(0.5);
    expect(bar.curr).toBe(5);

    bar.update(0.25, { token: 'value' });
    expect(bar.curr).toBe(2); // floor(10 * 0.25) = 2
    expect(bar.tokens.token).toBe('value');

    bar.update(1);
    expect(bar.curr).toBe(10);
    expect(bar.complete).toBe(true);
  });

  test('interrupt methods work correctly', () => {
    const bar = new ProgressBar(':bar', { total: 10, stream: mockStream });

    bar.interrupt('message');
    expect(mockStream.clearLine).toHaveBeenCalled();
    expect(mockStream.cursorTo).toHaveBeenCalledWith(0);
    expect(mockStream.write).toHaveBeenCalledWith('message');
    expect(mockStream.write).toHaveBeenCalledWith('\n');

    mockStream.write.mockClear();
    bar.interruptBegin();
    expect(mockStream.clearLine).toHaveBeenCalled();
    expect(mockStream.cursorTo).toHaveBeenCalledWith(0);

    bar.interruptEnd();
    expect(mockStream.write).toHaveBeenCalled();
  });

  test('terminate handles clear option', () => {
    const bar1 = new ProgressBar(':bar', { total: 10, stream: mockStream, clear: false });
    bar1.terminate();
    expect(mockStream.write).toHaveBeenCalledWith('\n');

    mockStream.write.mockClear();
    const bar2 = new ProgressBar(':bar', { total: 10, stream: mockStream, clear: true });
    bar2.terminate();
    expect(mockStream.clearLine).toHaveBeenCalled();
    expect(mockStream.cursorTo).toHaveBeenCalledWith(0);
  });

  test('handles edge cases', () => {
    // Very narrow terminal
    mockStream.columns = 5;
    const bar1 = new ProgressBar(':bar', { total: 10, stream: mockStream });
    bar1.tick(1);
    expect(mockStream.write).toHaveBeenCalled();

    // Windows platform
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const bar2 = new ProgressBar(':bar', { total: 10, stream: mockStream });
    bar2.tick(1);
    expect(mockStream.write).toHaveBeenCalled();

    // Negative progress
    const bar3 = new ProgressBar(':bar', { total: 10, stream: mockStream });
    bar3.curr = -5;
    bar3.render();
    expect(mockStream.write).toHaveBeenCalled();
  });
});
