
export class Cluster {
    name: string;
    city: string;
    country: string;
    clusterIPOrURL: string;
    clusterAdminId: string;
    clusterAdminPassword: string;
    kerberosPrincipal: string;
    kerberosKeytab: string;


    constructor(name?:string, country?:string, city?:string,
                clusterIPOrURL?:string, clusterAdminId?:string, clusterAdminPassword?:string,
                kerberosPrincipal?:string, kerberosKeytab?:string) {
        this.name = name;
        this.country = country;
        this.city = city;
        this.clusterIPOrURL = clusterIPOrURL;
        this.clusterAdminId = clusterAdminId;
        this.clusterAdminPassword = clusterAdminPassword;
        this.kerberosPrincipal = kerberosPrincipal;
        this.kerberosKeytab = kerberosKeytab;
    }
}







