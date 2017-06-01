export class MapData {
  constructor(
    public start: Point,
    public end?: Point,
    public connectionStatus?: MapConnectionStatus
  ) { }
}

export class Point {
  constructor(
    public latitude: number,
    public longitude: number,
    public status?: MapConnectionStatus,
    public name = ''
  ) { }
}

export enum MapConnectionStatus {
  UP,
  DOWN,
  NA
}

export interface MapSizeSettings {
  height: string;
  width: string;
  zoom: number;
}

export enum MapSize {
  SMALL,
  MEDIUM,
  LARGE,
  EXTRALARGE,
  FULLWIDTH
}
