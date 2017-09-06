/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

export class MapData {
  constructor(public start: Point, public end?: Point, public connectionStatus?: MapConnectionStatus) {
  };
}

export class Point {
  constructor(public latitude: number, public longitude: number, public status?: MapConnectionStatus) {
  };
}

export class MapDimensions {
  constructor(public height: string, public width: string, public zoom: number) {
  };
}

export enum MapConnectionStatus {
  UP,
  DOWN,
  NA
}

export enum MapSize {
  SMALL,
  MEDIUM,
  LARGE,
  EXTRALARGE
}
