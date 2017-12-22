/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as uuid from 'uuid';

export const capitalize = (str: string) => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : '';
export const simpleSearch = (str: string, search: string): boolean => {
  let reg: RegExp;
  try {
    reg = new RegExp(search);
  } catch (e) {
    reg = new RegExp('');
  }
  return reg.test(str);
};

export const genId = (): string => uuid.v4();
