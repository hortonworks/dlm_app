import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';
import {AmbariService} from '../../services/ambari.service';
import {Ambari} from '../../models/ambari';

declare var Datamap:any;

@Component({
    selector: 'view-data',
    templateUrl: 'assets/app/components/view-data/view-data.component.html',
    styleUrls: ['assets/app/components/view-data/view-data.component.css']
})
export class ViewDataComponent implements OnInit, AfterViewInit {
    map: any;
    hostName: string;
    search: string = '';
    dataSourceName: string;
    breadCrumbMap: any = {};
    cluster: Ambari = new Ambari();

    @ViewChild('bread-crumb') breadCrumb: BreadcrumbComponent;

    constructor(private activatedRoute: ActivatedRoute, private clusterService: AmbariService) {}

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataSourceName = params['id'];
            this.hostName = window.location.search.replace('?host=', '');
            this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
            this.breadCrumbMap[this.dataSourceName] = '';
            this.getClusterData();
        });
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('mapcontainer-replication'),
            projection: 'mercator',
            height: 600,
            width: 1116,
            fills: {
                defaultFill: '#ABE3F3',
                UP: '#9FCE63',
                DOWN: '#D21E28'
            },
            data: {
                'UP': {fillKey: 'UP'},
                'DOWN': {fillKey: 'DOWN'}
            },
            geographyConfig: {
                highlightFillColor: '#ADE4F3'
            },
            bubblesConfig: {
                borderWidth: 2,
                borderColor: '#FFFFFF',
                highlightBorderColor: '#898989',
                highlightBorderWidth: 2,
                highlightFillColor: '#898989'
            }
        });
    }

    getClusterData() {
        this.clusterService.getByName(this.dataSourceName).subscribe(cluster => {
            this.cluster = cluster;
        });
    }

    eventHandler($event, search: string) {
        if ($event.keyCode === 13) {
            this.search = search;
        }
    }
}
