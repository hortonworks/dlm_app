import {Component,AfterViewInit, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DataCenterService} from '../../services/data-center.service';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../common/utils/city-names';
import {DataCenterDetails} from '../../models/data-center-details';

declare var Datamap:any;

export class DashboardRow {
    dataCenter: DataCenter;
    nodes: number = 0;
    capacityUtilization: number = 0;
    averageJobsPerDay: number = 0;
    dataSize: string;
    cost: number = 0;
    clusters: number = 0;
    hostStatus: string = '';

    bytesToSize(bytes: number): string {
        let sizes: string[] = ['KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) {
            return 'n/a';
        }
        let i = parseInt( '' + Math.floor(Math.log(bytes) / Math.log(1024))  );
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    constructor(dataCenter: DataCenter, dataCenterDetails: DataCenterDetails) {
        let diskUsed: number = 0;
        let state: boolean = null;
        this.dataCenter = dataCenter;
        this.nodes = dataCenterDetails.hosts.length;


        for (let nameNodeInfo of dataCenterDetails.nameNodeInfo) {
            this.capacityUtilization += nameNodeInfo.usedPercentage;
        }

        for (let hosts of dataCenterDetails.hosts) {
            for (let diskStat of hosts.diskStats) {
                diskUsed += parseInt(diskStat.used);
            }

            if( hosts.hostStatus === 'HEALTHY' && state === null) {
                state = true;
            } else if (hosts.hostStatus === 'UNHEALTHY' && state === null) {
                state = false;
            } else {
                state = state && (hosts.hostStatus === 'HEALTHY' ? true : false);
            }
        }

        this.cost = 0;
        this.averageJobsPerDay = 0;
        this.dataSize = this.bytesToSize(diskUsed);
        this.clusters += dataCenterDetails.numClusters;
        this.hostStatus = state ? 'HEALTHY' : 'UNHEALTHY';
        this.capacityUtilization = parseFloat( ((this.capacityUtilization/( 100* dataCenterDetails.nameNodeInfo.length)) * 100).toPrecision(3) );
    }
}

@Component({
    selector: 'dash-board',
    styleUrls: ['assets/app/components/dashboard/dashboard.css'],
    templateUrl: 'assets/app/components/dashboard/dashboard.html'
})


export default class DashboardComponent implements AfterViewInit, OnInit {
    map: any;
    bubbles: any[] = [];
    dataCenters: DataCenter[] = [];
    dataCenterNames: string[] = [];
    dashboardRows: DashboardRow[] = [];

    constructor(private router: Router, private dataCenterService: DataCenterService) {}

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('mapcontainer'),projection: 'mercator',
            fills: {
                defaultFill: '#ABE3F3',
                HEALTHY: '#9FCE63',
                UNHEALTHY: '#D21E28',
                UNKNOWN: '#898989'
            },
            data: {
                'HEALTHY': {fillKey: 'HEALTHY'},
                'UNHEALTHY': {fillKey: 'UNHEALTHY'},
                'UNKNOWN': {fillKey: '#898989'}
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

    drawBubbles() {
        if (this.bubbles.length > 0) {
            this.map.bubbles(this.bubbles, {
                popupTemplate: function (geo:any, data:any) {
                    return ['<div class="demo-card-wide mdl-card mdl-shadow--2dp"> ' +
                    '<div class = "mdl-card__actions mdl-card--border"> ' +
                    '<div> <div class = "card-super-text">' + data.location + ' </div> ' +
                    '<div class = "card-title-text">' + data.name + '</div> </div>' +
                    '</div > <div class = "card-padding"> ' +
                    '<table  class="card-table" cellspacing="0" style="background:#FFFFFF;font-size:12px;width:100%;border-radius:4px;"> ' +
                    '<tr><td class="card-table-cell">JOBS </td>     <td class="card-table-cell">' + data.jobs + '</td></tr> ' +
                    '<tr><td class="card-table-cell">USAGE </td>    <td class="card-table-cell">' + data.usage + '</td></tr> ' +
                    '<tr><td class="card-table-cell">DATA </td>     <td class="card-table-cell">' + data.data + '</td></tr> ' +
                    '<tr><td class="card-table-cell">CLUSTERS </td> <td class="card-table-cell">' + data.clusters + '</td></tr> ' +
                    '</table > </div > </div >'].join(' ');
                }
            });
        }
    }

    ngOnInit() {
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.dataCenters = dataCenters;
            this.getDataCenterDetails();
        });
    }

    getDataCenterDetails() {
        let dataCenterNamesToDataCenter = {};
        for (let dataCenter of this.dataCenters) {
            dataCenterNamesToDataCenter[dataCenter.name] = dataCenter;
        }

        this.dataCenterNames = Object.keys(dataCenterNamesToDataCenter);

        let name = this.dataCenterNames.pop();
        while (name !== undefined) {
            this.getDataCenterDetailsByName(name, dataCenterNamesToDataCenter);
            name = this.dataCenterNames.pop();
        }
    }

    private getDataCenterDetailsByName(name:string, dataCenterNamesToDataCenter:{}) {
        this.dataCenterService.getDetails(name).subscribe((dataCenterDetail)=> {
            console.log(dataCenterDetail);
            this.dashboardRows.push(new DashboardRow(dataCenterNamesToDataCenter[name], dataCenterDetail));
            if (this.dataCenterNames.length === 0) {
                this.createCityBubbles();
            }
        });
    }

    createCityBubbles() {
        for (let dashboardRow of this.dashboardRows) {
            let coordinates = CityNames.getCityCoordinates(dashboardRow.dataCenter.location.country, dashboardRow.dataCenter.location.place);
            this.bubbles.push({
                name: dashboardRow.dataCenter.name,
                country: dashboardRow.dataCenter.location.country,
                jobs: dashboardRow.averageJobsPerDay,
                usage: dashboardRow.capacityUtilization,
                data: dashboardRow.dataSize,
                clusters: dashboardRow.clusters,
                location: dashboardRow.dataCenter.location.place,
                radius:10,
                yield: 400,
                fillKey: dashboardRow.hostStatus,
                latitude: parseFloat(coordinates[0]),
                longitude: parseFloat(coordinates[1])
            });
        }

        this.drawBubbles();
    }

    onDataCenterSelect(dataCenter: DataCenter) {
        this.router.navigate(['/ui/view-cluster/' + dataCenter.name]);
    }
}
