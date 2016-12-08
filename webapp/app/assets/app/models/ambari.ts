
import {Credentials} from './credentials';
export class Cluster {
    protocol: string;
    host: string;
    port: number;
    dataCenter: string;
    credentials: Credentials;

    noOfNodes: number;
    upTime: number;
    diskUsed: number;
    noOfJobs: number;
    noOfTables: number;
    noOfFiles: number;
    averageNoOfUsers: number;
    serviceName: string;

    constructor() {
        this.credentials = new Credentials();
    }

    // constructor(name?:string, country?:string, city?:string,
    //             clusterIPOrURL?:string, clusterAdminId?:string, clusterAdminPassword?:string,
    //             kerberosPrincipal?:string, kerberosKeytab?:string) {
    //     this.name = name;
    //     this.country = country;
    //     this.city = city;
    //     this.clusterIPOrURL = clusterIPOrURL;
    //     this.clusterAdminId = clusterAdminId;
    //     this.clusterAdminPassword = clusterAdminPassword;
    //     this.kerberosPrincipal = kerberosPrincipal;
    //     this.kerberosKeytab = kerberosKeytab;
    // }

    public static createClusterForTest(name: string) {
        let cluster = new Cluster();
        // cluster.name = name;
        // cluster.noOfNodes = parseInt((Math.random()* 100) + '');
        // cluster.upTime = parseInt((Math.random()* 100) + '');
        // cluster.diskUsed = parseInt((Math.random()* 100) + '');
        // cluster.noOfJobs = parseInt((Math.random()* 100) + '');
        // cluster.noOfTables = parseInt((Math.random()* 100) + '');
        // cluster.noOfFiles = parseInt((Math.random()* 100) + '');
        // cluster.averageNoOfUsers = parseInt((Math.random()* 100) + '');
        // cluster.serviceName = ['EDW', 'SPARK', 'HIVE', 'SPARK', 'HIVE'][Math.floor((Math.random() * 4) + 1)];

        return cluster;
    }
}







