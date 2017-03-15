import {Ambari} from './ambari';
import {Location} from './location';
export class DataCenter {
    name: string;
    location: Location;
    deployedAt: string;

    nodes: number;
    capacityUtilization: number;
    averageJobsPerDay: number;
    dataSize: number;
    cost: number;
    incomingData: number;
    outgoingData: number;
    status: string;
    upTime: number;
    noOfClusters: number;
    noOfNodes: number;
    noOfUsers: number;

    clusters: Ambari[] = [];

    constructor() {
        this.location = new Location();
        this.deployedAt = 'ON-PREMISE';
    }

    public static getDataByName(name: string): DataCenter {
        for (let dataCenter of DataCenter.getData()) {
            if (dataCenter.name === name) {
                return dataCenter;
            }
        }

        return new DataCenter();
    }

    public static getData() {
        let datacenters: DataCenter[] = [];
        return datacenters;
    }
}

export class LocationModel {
    place:string;
    country:string;

    constructor(place: string,country: string) {
        this.place = place;
        this.country = country;
    }
}

export class DataCenterRequest {
    name:String;
    location:LocationModel;

    constructor(name: String, location: LocationModel) {
        this.name = name;
        this.location = location;
    }
}

