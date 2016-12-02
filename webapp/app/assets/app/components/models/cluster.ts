/**
 * Created by rksv on 27/11/16.
 */
export class Cluster {
    name: string;
    country: string;
    city: string;
    address: string;
    clusterIPOrURL: string;
    clusterAdminId: string;
    clusterAdminPassword: string;
    kerberosPrincipal: string;
    kerberosKeytab: string;


    constructor(name?:string, country?:string, city?:string, address?:string,
                clusterIPOrURL?:string, clusterAdminId?:string, clusterAdminPassword?:string,
                kerberosPrincipal?:string, kerberosKeytab?:string) {
        this.name = name;
        this.country = country;
        this.city = city;
        this.address = address;
        this.clusterIPOrURL = clusterIPOrURL;
        this.clusterAdminId = clusterAdminId;
        this.clusterAdminPassword = clusterAdminPassword;
        this.kerberosPrincipal = kerberosPrincipal;
        this.kerberosKeytab = kerberosKeytab;
    }
}
