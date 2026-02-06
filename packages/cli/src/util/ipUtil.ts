/**
 * Referenced from StackOverflow:
 * https://stackoverflow.com/questions/5284147/validating-ipv4-addresses-with-regexp
 *
 * Credits to Danail Gabenski
 */
const isIpv4Address = (address) => {
  const patternForIpV4 = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

  return patternForIpV4.test(address);
};

/**
 * Referenced from StackOverflow:
 * https://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
 *
 * Credits to David M. Syzdek
 */
const isIpv6Address = (address) => {
  const patternForIpV6 = new RegExp(
    '^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}'
    + '|([0-9a-fA-F]{1,4}:){1,7}:'
    + '|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}'
    + '|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}'
    + '|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}'
    + '|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}'
    + '|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}'
    + '|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})'
    + '|:((:[0-9a-fA-F]{1,4}){1,7}|:)'
    + '|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}'
    + '|::(ffff(:0{1,4}){0,1}:){0,1}'
    + '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}'
    + '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])'
    + '|([0-9a-fA-F]{1,4}:){1,4}:'
    + '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}'
    + '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$');

  return patternForIpV6.test(address);
};

function isValidServeHost(address) {
  if (address === 'localhost') {
    return true;
  }

  return isIpv4Address(address) || isIpv6Address(address);
}

function isIPAddressZero(address) {
  const patternForIPv4Zero = /^0(\.0)*$/;
  const patternForIPv6Zero = /^([0]{0,4}:){0,7}([0]{0,4}){0,1}$/;

  return patternForIPv4Zero.test(address) || patternForIPv6Zero.test(address);
}

module.exports = {
  isValidServeHost,
  isIPAddressZero,
};
