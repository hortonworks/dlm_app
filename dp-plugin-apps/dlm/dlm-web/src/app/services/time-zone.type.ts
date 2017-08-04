/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
