/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import * as _isEqual from 'lodash.isequal';
import * as _merge from 'lodash.merge';
import * as _cloneDeep from 'lodash.clonedeep';

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

export const cloneDeep = _cloneDeep;

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

export const toMapByField = (collection, fieldName) => {
  const ret = new Map();
  collection.forEach(item => {
    const val = multiLevelResolve(item, fieldName);
    ret.set(val, item);
  });
  return ret;
};

export const getValues = <T = any>(object: any): T[] => Object.keys(object).map(k => object[k]);

export const merge = _merge;
