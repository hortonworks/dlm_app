const map = {
  b: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024
};
const parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb)$/i;

export const sizeToBites = (size: string, defaultValue: number): number => {
  // only digits
  if (size.match(/^\d+$/)) {
    return Number(size);
  }
  // no digits
  if (!size.match(/^[0-9]+/)) {
    return defaultValue;
  }
  size = size.toLowerCase();

  const results = parseRegExp.exec(size);
  let floatValue;
  let unit = 'b';

  if (!results) {
    floatValue = parseInt(size, 10);
    unit = 'b';
  } else {
    floatValue = parseFloat(results[1]);
    unit = results[4].toLowerCase();
  }

  return Math.floor(map[unit] * floatValue);
};
