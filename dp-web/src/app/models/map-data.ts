export class MapData {
 start : Point
 end? : Point
 connectionStatus : Status
 constructor(start:Point, end?:Point, connectionStatus?:Status){
    this.start = start;
    this.end = end;
    this.connectionStatus = connectionStatus;
 }
}

export class Point {
    latitude : number;
    longitude : number;
    status?:Status
    constructor(latitude:number, longitude:number, status:Status){
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
    }
}

export enum Status {
    UP,
    DOWN,
    NA
}
