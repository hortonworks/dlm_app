import {Ambari} from './ambari';
import {Location} from './location';
export class DataCenter {
    name: string;
    location: Location;

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
    deployedAt: string;

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
        //
        // let dataCenter = new DataCenter();
        // dataCenter.name = 'London';
        // dataCenter.country = 'United Kingdom';
        // dataCenter.city = 'London';
        // dataCenter.nodes = 23;
        // dataCenter.capacityUtilization = 50;
        // dataCenter.averageJobsPerDay = 100;
        // dataCenter.dataSize = 100;
        // dataCenter.cost = 500;
        // dataCenter.incomingData = 55;
        // dataCenter.outgoingData = 45;
        // dataCenter.status = 'UP';
        // dataCenter.location = 'ON PREM';
        //
        // dataCenter.upTime = 23;
        // dataCenter.noOfClusters = 32;
        // dataCenter.noOfNodes = 40;
        // dataCenter.noOfUsers = 12;
        //
        // datacenters.push(dataCenter);
        //
        // let sf = new DataCenter();
        // sf.name = 'SanFransisco';
        // sf.country = 'United States of America';
        // sf.city = 'San Francisco';
        // sf.nodes = 88;
        // sf.capacityUtilization = 23;
        // sf.averageJobsPerDay = 100;
        // sf.dataSize = 100;
        // sf.cost = 500;
        // sf.incomingData = 60;
        // sf.outgoingData = 40;
        // sf.status = 'DOWN';
        // sf.location = 'AWS';
        //
        // sf.upTime = 55;
        // sf.noOfClusters = 55;
        // sf.noOfNodes = 55;
        // sf.noOfUsers = 55;
        //
        // datacenters.push(sf);
        //
        // let mumbai = new DataCenter();
        // mumbai.name = 'Mumbai';
        // mumbai.country = 'India';
        // mumbai.city = 'Mumbai';
        // mumbai.nodes = 87;
        // mumbai.capacityUtilization = 45;
        // mumbai.averageJobsPerDay = 100;
        // mumbai.dataSize = 100;
        // mumbai.cost = 500;
        // mumbai.incomingData = 30;
        // mumbai.outgoingData = 70;
        // mumbai.status = 'UP';
        // mumbai.location = 'MS AZURE';
        //
        // mumbai.upTime = 23;
        // mumbai.noOfClusters = 32;
        // mumbai.noOfNodes = 40;
        // mumbai.noOfUsers = 12;
        //
        // datacenters.push(mumbai);
        //
        // let dublin = new DataCenter();
        // dublin.name = 'Dublin';
        // dublin.country = 'Ireland';
        // dublin.city = 'Dublin';
        // dublin.nodes = 64;
        // dublin.capacityUtilization = 65;
        // dublin.averageJobsPerDay = 100;
        // dublin.dataSize = 100;
        // dublin.cost = 500;
        // dublin.incomingData = 35;
        // dublin.outgoingData = 65;
        // dublin.status = 'DOWN';
        // dublin.location = 'ON PREM';
        //
        // dublin.upTime = 23;
        // dublin.noOfClusters = 32;
        // dublin.noOfNodes = 40;
        // dublin.noOfUsers = 12;
        //
        // datacenters.push(dublin);
        //
        // let bangalore = new DataCenter();
        // bangalore.name = 'Bengaluru';
        // bangalore.country = 'India';
        // bangalore.city = 'Bangalore';
        // bangalore.nodes = 78;
        // bangalore.capacityUtilization = 87;
        // bangalore.averageJobsPerDay = 100;
        // bangalore.dataSize = 100;
        // bangalore.cost = 500;
        // bangalore.incomingData = 55;
        // bangalore.outgoingData = 45;
        // bangalore.status = 'UP';
        // bangalore.location = 'AWS';
        //
        // bangalore.upTime = 23;
        // bangalore.noOfClusters = 32;
        // bangalore.noOfNodes = 40;
        // bangalore.noOfUsers = 12;
        //
        // datacenters.push(bangalore);
        //
        // let tokyo = new DataCenter();
        // tokyo.name = 'Tokyo';
        // tokyo.country = 'Japan';
        // tokyo.city = 'Tokyo';
        // tokyo.nodes = 45;
        // tokyo.capacityUtilization = 32;
        // tokyo.averageJobsPerDay = 100;
        // tokyo.dataSize = 100;
        // tokyo.cost = 500;
        // tokyo.incomingData = 25;
        // tokyo.outgoingData = 75;
        // tokyo.status = 'UP';
        // tokyo.location = 'MS AZURE';
        //
        // tokyo.upTime = 23;
        // tokyo.noOfClusters = 32;
        // tokyo.noOfNodes = 40;
        // tokyo.noOfUsers = 12;
        //
        // datacenters.push(tokyo);
        //
        // let seattle = new DataCenter();
        // seattle.name = 'Seattle';
        // seattle.country = 'United States of America';
        // seattle.city = 'Seattle';
        // seattle.nodes = 43;
        // seattle.capacityUtilization = 52;
        // seattle.averageJobsPerDay = 100;
        // seattle.dataSize = 100;
        // seattle.cost = 500;
        // seattle.incomingData = 30;
        // seattle.outgoingData = 70;
        // seattle.status = 'UP';
        // seattle.location = 'ON PREM';
        //
        // seattle.upTime = 23;
        // seattle.noOfClusters = 32;
        // seattle.noOfNodes = 40;
        // seattle.noOfUsers = 12;
        //
        // datacenters.push(seattle);
        //
        // let buenosAires = new DataCenter();
        // buenosAires.name = 'Buenos Aires';
        // buenosAires.country = 'Argentina';
        // buenosAires.city = 'Buenos Aires';
        // buenosAires.nodes = 12;
        // buenosAires.capacityUtilization = 5;
        // buenosAires.averageJobsPerDay = 10;
        // buenosAires.dataSize = 30;
        // buenosAires.cost = 23;
        // buenosAires.incomingData = 3;
        // buenosAires.outgoingData = 20;
        // buenosAires.status = 'UP';
        // buenosAires.location = 'AWS';
        //
        // buenosAires.upTime = 23;
        // buenosAires.noOfClusters = 32;
        // buenosAires.noOfNodes = 40;
        // buenosAires.noOfUsers = 12;
        //
        // datacenters.push(buenosAires);
        //
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

