const { isValidServeHost, isIPAddressZero } = require('../../src/util/ipUtil');

describe('isValidServeHost', () => {
  test('returns true for localhost', () => {
    expect(isValidServeHost('localhost')).toBe(true);
  });

  test('returns true for valid IPv4 addresses', () => {
    expect(isValidServeHost('127.0.0.1')).toBe(true);
    expect(isValidServeHost('192.168.1.1')).toBe(true);
    expect(isValidServeHost('0.0.0.0')).toBe(true);
    expect(isValidServeHost('255.255.255.255')).toBe(true);
  });

  test('returns false for invalid IPv4 addresses', () => {
    expect(isValidServeHost('192.168.1')).toBe(false);
    expect(isValidServeHost('192.168.1.1.1')).toBe(false);
    expect(isValidServeHost('999.999.999.999')).toBe(false);
    expect(isValidServeHost('192.168.1.01')).toBe(false);
    expect(isValidServeHost('abc.def.ghi.jkl')).toBe(false);
    expect(isValidServeHost('')).toBe(false);
  });

  test('returns true for valid IPv6 addresses', () => {
    expect(isValidServeHost('2001:0db8:0000:0000:0000:0000:0002:0001')).toBe(true);
    expect(isValidServeHost('2001:db8:0:0:0:0:2:1')).toBe(true);
    expect(isValidServeHost('2001:db8::2:1')).toBe(true);
    expect(isValidServeHost('::1')).toBe(true);
    expect(isValidServeHost('::')).toBe(true);
    expect(isValidServeHost('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')).toBe(true);
    expect(isValidServeHost('ABCD::abcd')).toBe(true);
  });

  test('returns false for invalid IPv6 addresses', () => {
    expect(isValidServeHost('2001:db8')).toBe(false);
    expect(isValidServeHost('2001:db8:0:0:0:0:2:1:9')).toBe(false);
    expect(isValidServeHost('2001:db8:::1')).toBe(false);
    expect(isValidServeHost('2001:db8::1::1')).toBe(false);
    expect(isValidServeHost('2001:db8::zzzz')).toBe(false);
    expect(isValidServeHost('12345::1')).toBe(false);
  });
});

describe('isIPAddressZero', () => {
  test('returns true for IPv4 zero address', () => {
    expect(isIPAddressZero('0.0.0.0')).toBe(true);
  });

  test('returns false for IPv4 non-zero address', () => {
    expect(isIPAddressZero('127.0.0.1')).toBe(false);
  });

  test('returns true for IPv6 zero address', () => {
    expect(isIPAddressZero('::')).toBe(true);
    expect(isIPAddressZero('0:0:0:0:0:0:0:0')).toBe(true);
    expect(isIPAddressZero('0::')).toBe(true);
    expect(isIPAddressZero('::0')).toBe(true);
    expect(isIPAddressZero('0:0::0:0')).toBe(true);
    expect(isIPAddressZero('0000::0000')).toBe(true);
  });

  test('returns false for IPv6 non-zero address', () => {
    expect(isIPAddressZero('2001:db8::2:1')).toBe(false);
  });
});
