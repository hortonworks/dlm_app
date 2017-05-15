export interface ShownTimeZone {
  /**
   * offset-value (0, 180, 240 etc)
   */
  utcOffset: number;
  /**
   * string like '120180|Europe'
   */
  value: string;
  /**
   * string like '(UTC+02:00) Europe / Athens, Kiev, Minsk'
   */
  label: string;

  zones: FormattedTimezone[];
}

export interface FormattedTimezone {
  /**
   * offset-value (0, 180, 240 etc)
   */
  utcOffset: number;
  /**
   * formatted offset-value ('+00:00', '-02:00' etc)
   */
  formattedOffset: string;
  /**
   * timezone's name (like 'Europe/Athens')
   */
  value: string;
  /**
   * timezone's region (for 'Europe/Athens' it will be 'Europe')
   */
  region: string;
  /**
   * timezone's city (for 'Europe/Athens' it will be 'Athens')
   */
  city: string;
}

export interface TimezonesMap {
  [id: string]: ShownTimeZone;
}
