/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export enum TableTheme {
  Plain,
  Cards
}

export const PLAIN_TABLE_ROW_HEIGHT = 36;

export interface ThemeSetting {
  className: string;
  rowHeight: string|number;
  headerHeight: string|number;
  footerHeight: string|number;
}

export const TableThemeSettings = {
  [TableTheme.Plain]: <ThemeSetting>{
    className: 'plain-theme',
    rowHeight: PLAIN_TABLE_ROW_HEIGHT,
    headerHeight: PLAIN_TABLE_ROW_HEIGHT,
    footerHeight: PLAIN_TABLE_ROW_HEIGHT
  },
  [TableTheme.Cards]: <ThemeSetting>{
    className: 'cards-theme',
    rowHeight: 90,
    headerHeight: 22,
    footerHeight: PLAIN_TABLE_ROW_HEIGHT
  }
};
