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
