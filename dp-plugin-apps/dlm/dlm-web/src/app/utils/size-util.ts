/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

const map = {
  b: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024
};

const units = [
  'bytes',
  'KB',
  'MB',
  'GB',
  'TB',
  'PB'
];

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

export const bytesToSize = (bytes: number = 0, precision: number = 2): string => {
  if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) {
    return '<i class="fa fa-minus"></i>';
  }

  let unit = 0;
  while (bytes >= 1024) {
    bytes /= 1024;
    unit++;
  }
  return bytes.toFixed(+precision) + ' <span class="unit">' + units[unit] + '</span>';
};
