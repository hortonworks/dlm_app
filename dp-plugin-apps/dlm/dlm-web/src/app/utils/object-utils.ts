/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as _isEqual from 'lodash.isequal';
import * as _merge from 'lodash.merge';

export const toKeyValueArray = (obj: string) => {
  let result = [];
  Object.keys(obj).forEach(key => {
    const values = obj[key];
    const concatWith = Array.isArray(values) ? values.map(value => ({key, value})) : [{key, value: values}];
    result = [...result, ...concatWith];
  });
  return result;
};

export const omit = (obj, ...keys) => Object.keys(obj).reduce((result, key) => {
  if (keys.indexOf(key) === -1) {
    result[key] = obj[key];
  }
  return result;
}, {});

export const omitEmpty = (obj) => Object.keys(obj).reduce((result, key) => {
  if (!(obj[key] === '' || obj[key] === undefined || obj[key] === null)) {
    result[key] = obj[key];
  }
  return result;
}, {});

export const isEmpty = (obj) => Object.keys(obj).length === 0;

export const isEqual = _isEqual;

/**
* Resolve and return value of an object for multi-level dynamic key
* @param obj
* @param path
* @returns {any}
* @constructor
*/
export const multiLevelResolve = (obj, path) => {
  path = path.split('.');
  let current = obj;
  while (path.length) {
    if (typeof current !== 'object') {
      return undefined;
    }
    current = current[path.shift()];
  }
  return current;
};

export const merge = _merge;
