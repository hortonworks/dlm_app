/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
    const value = item[keyName];
    if (group[value] == null) {
      group[value] = [item];
    } else {
      group[value].push(item);
    }
  });
  return group;
};

export const sortByDateField = (collection, keyName) =>
  collection.sort((a, b) =>
    new Date(a[keyName]).getTime() > new Date(b[keyName]).getTime() ? -1 : 1);

export const without = (collection, itemToRemove) =>
  collection.indexOf(itemToRemove) === -1 ? collection : collection.filter(item => item !== itemToRemove);

export const contains = (collection, item): boolean => collection.indexOf(item) > -1;
