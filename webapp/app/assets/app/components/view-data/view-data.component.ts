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
    search: string = '';
    clusterName: string;
    breadCrumbMap: any = {};
    cluster: Ambari = new Ambari();

    @ViewChild('bread-crumb') breadCrumb: BreadcrumbComponent;

    constructor(private activatedRoute: ActivatedRoute, private clusterService: AmbariService) {}

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.clusterName = params['id'];
            this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
            this.breadCrumbMap[this.clusterName] = '';
            this.getClusterData();
        });
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('mapcontainer-replication'),projection: 'mercator',
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

        // if (this.bubbles.length > 0) {
        //     this.map.bubbles(this.bubbles, {
        //         popupTemplate: function (geo: any, data: any) {
        //             return ['<div class="demo-card-wide mdl-card mdl-shadow--2dp"> ' +
        //             '<div class = "mdl-card__actions mdl-card--border"> ' +
        //             '<div> <div class = "card-super-text">'+ data.location +' </div> ' +
        //             '<div class = "card-title-text">'+ data.name +'</div> </div>' +
        //             '</div > <div class = "card-padding"> ' +
        //             '<table  class="card-table" cellspacing="0" style="background:#FFFFFF;font-size:12px;width:100%;border-radius:4px;"> ' +
        //             '<tr><td class="card-table-cell">JOBS </td>     <td class="card-table-cell">'+ data.jobs +'</td></tr> ' +
        //             '<tr><td class="card-table-cell">USAGE </td>    <td class="card-table-cell">'+ data.usage +'</td></tr> ' +
        //             '<tr><td class="card-table-cell">DATA </td>     <td class="card-table-cell">'+ data.data +'</td></tr> ' +
        //             '<tr><td class="card-table-cell">CLUSTERS </td> <td class="card-table-cell">'+ data.noOfClusters +'</td></tr> ' +
        //             '</table > </div > </div >'].join(' ');
        //         }
        //     });
        // }
    }

    getClusterData() {
        this.clusterService.getByName(this.clusterName).subscribe(cluster => {
            this.cluster = cluster;
        });
    }
}
