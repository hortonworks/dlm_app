import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CityNames} from '../../common/utils/city-names';
import {ClusterService} from '../../services/cluster.service';
import {Cluster} from '../models/cluster';

declare var Datamap:any;

@Component({
    selector: 'view-cluster' ,
    styleUrls: ['assets/app/components/view-cluster/view-cluster.component.css'],
    templateUrl: 'assets/app/components/view-cluster/view-cluster.component.html'
})

export default class ViewClusterComponent implements AfterViewInit, OnInit {

    dataCenterName: string = '';
    breadCrumbMap: any = {};

    constructor(private activatedRoute: ActivatedRoute ) {}

    ngAfterViewInit() {
        console.log('here');
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataCenterName = params['id'];
            this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
            this.breadCrumbMap[this.dataCenterName] = '';
        });
    }
}