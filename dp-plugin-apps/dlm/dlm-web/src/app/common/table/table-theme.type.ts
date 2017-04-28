export enum TableTheme {
  Plain,
  Cards
};

export const PLAIN_TABLE_ROW_HEIGHT = 36;

export interface ThemeSetting {
  className: string;
  rowHeight: string|number;
  headerHeight: string|number;
  footerHeight: string|number;
};

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
