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

import {multiLevelResolve} from './object-utils';

export const flatten = (list) => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
export const unique = (list) => list.filter((item, index, arr) => arr.indexOf(item) === index);
export const sum = (list) => list.reduce((acc, item) => acc + item, 0);

export const filterCollection = (collection, filters) => {
  const fields = Object.keys(filters);
  return collection.filter(row => {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const filterValue = filters[field];
      const value = multiLevelResolve(row, field);
      if (Array.isArray(filterValue)) {
        if (filterValue.length && filterValue.indexOf(value) === -1) {
          return false;
        }
      } else {
        if (filterValue && filterValue !== value) {
          return false;
        }
      }
    }
    return true;
  });
};

export const groupByKey = (collection, keyName) => {
  const group = {};
  collection.forEach(item => {
    const value = multiLevelResolve(item, keyName);
    if (group[value] == null) {
      group[value] = [item];
    } else {
      group[value].push(item);
    }
  });
  return group;
};

export const uniqBy = (collection, keyName) => {
  const ret = [];
  const seen = new Set();
  collection.forEach(item => {
    const val = multiLevelResolve(item, keyName);
    if (!seen.has(val)) {
      seen.add(val);
      ret.push(item);
    }
  });
  return ret;
};

export const sortByDateField = (collection, keyName) =>
  collection.sort((a, b) =>
    new Date(a[keyName]).getTime() > new Date(b[keyName]).getTime() ? -1 : 1);

export const without = (collection, itemToRemove) =>
  collection.indexOf(itemToRemove) === -1 ? collection : collection.filter(item => item !== itemToRemove);

export const contains = (collection, item): boolean => collection.indexOf(item) > -1;
