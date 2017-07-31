import { Cluster } from './cluster.model';
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

export interface ClusterMapData {
  start: ClusterMapPoint;
  end?: ClusterMapPoint;
  connectionStatus?: MapConnectionStatus;
}

export interface ClusterMapPoint {
  cluster: Cluster;
  status?: MapConnectionStatus;
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
