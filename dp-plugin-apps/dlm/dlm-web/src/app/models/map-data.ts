export class MapData {
  start: Point;
  end?: Point;
  connectionStatus: MapConnectionStatus;
  constructor(start: Point, end?: Point, connectionStatus?: MapConnectionStatus) {
    this.start = start;
    this.end = end;
    this.connectionStatus = connectionStatus;
  }
}

export class Point {
  latitude: number;
  longitude: number;
  status?: MapConnectionStatus;
  name?: string;
  constructor(latitude: number, longitude: number, status: MapConnectionStatus, name= '') {
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
    this.name = name;
  }
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
  EXTRALARGE,
  FULLWIDTH
}
