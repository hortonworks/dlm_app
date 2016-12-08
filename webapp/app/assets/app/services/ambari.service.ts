import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Ambari} from '../models/ambari';
import {HttpUtil} from '../shared/utils/httpUtil';
import '../rxjs-operators';

@Injectable()
export class AmbariService {
    url = '/api/clusters';
    private cluster: Ambari;
    private clusters: Ambari[] = [];

    constructor(private http:Http) {
    //     this.cluster = new Ambari();
    //     this.cluster.name = 'London';
    //     this.cluster.country = 'United Kingdom';
    //     this.cluster.city = 'London';
    //     // this.cluster.address = '68 Upper Thames St';
    //     this.cluster.clusterIPOrURL = 'http://192.168.1.1:9090';
    //     this.cluster.clusterAdminId = 'admin';
    //     this.cluster.clusterAdminPassword = 'password';
    //     this.cluster.kerberosPrincipal = 'primary/instance@REALM';
    //     this.cluster.kerberosKeytab = '/usr/kerberos/sbin';
    //     this.clusters.push(this.cluster);
    }

    public put(cluster: Ambari):Observable<any> {
        return this.http.put(this.url, cluster, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public post(cluster: Ambari):Observable<any> {
        this.clusters.push(cluster);
        return Observable.create((observer: any) => {
           observer.next('{errorCode: 0: message: Success}');
           observer.complete();
        });
    }

    public get():Observable<Ambari[]> {
        return Observable.create((observer: any) => {
           observer.next(this.clusters);
           observer.complete();
        });
    }

    public  getByName(name: string):Observable<Ambari> {
        return Observable.create((observer: any) => {
            observer.next(Ambari.createClusterForTest(name));
            observer.complete();
        });
    }
}
