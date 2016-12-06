/**
 * Created by rksv on 27/11/16.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Cluster} from '../models/cluster';

@Injectable()
export class ClusterService {
    url = '/cluster';
    defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};

    private cluster: Cluster;
    private clusters: Cluster[] = [];

    constructor(private http:Http) {
        this.cluster = new Cluster();
        this.cluster.name = 'London';
        this.cluster.country = 'United Kingdom';
        this.cluster.city = 'London';
        this.cluster.address = '68 Upper Thames St';
        this.cluster.clusterIPOrURL = 'http://192.168.1.1:9090';
        this.cluster.clusterAdminId = 'admin';
        this.cluster.clusterAdminPassword = 'password';
        this.cluster.kerberosPrincipal = 'primary/instance@REALM';
        this.cluster.kerberosKeytab = '/usr/kerberos/sbin';
        this.clusters.push(this.cluster);
    }

    public post(cluster: Cluster):Observable<any> {
        this.clusters.push(cluster);
        return Observable.create((observer: any) => {
           observer.next('{errorCode: 0: message: Success}');
           observer.complete();
        });
    }

    public get():Observable<Cluster[]> {
        return Observable.create((observer: any) => {
           observer.next(this.clusters);
           observer.complete();
        });
    }

    public  getByName(name: string):Observable<Cluster> {
        return Observable.create((observer: any) => {
            observer.next(Cluster.createClusterForTest(name));
            observer.complete();
        });
    }
}
