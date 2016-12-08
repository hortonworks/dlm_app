import {Component,AfterViewInit, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DataCenterService} from '../../services/data-center.service';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../common/utils/city-names';

declare var Datamap:any;

@Component({
    selector: 'dash-board',
    styleUrls: ['assets/app/components/dashboard/dashboard.css'],
    templateUrl: 'assets/app/components/dashboard/dashboard.html'
})

export default class DashboardComponent implements AfterViewInit, OnInit {
    map: any;
    bubbles: any[] = [];
    dataCenters: DataCenter[] = [];

    constructor(private router: Router, private dataCenterService: DataCenterService) {}

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('mapcontainer'),projection: 'mercator',
            fills: {
                defaultFill: '#ABE3F3',
                UP: '#9FCE63',
                DOWN: '#D21E28',
                UNKNOWN: '#898989'
            },
            data: {
                'UP': {fillKey: 'UP'},
                'DOWN': {fillKey: 'DOWN'},
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
                    '<tr><td class="card-table-cell">CLUSTERS </td> <td class="card-table-cell">' + data.noOfClusters + '</td></tr> ' +
                    '</table > </div > </div >'].join(' ');
                }
            });
        }
    }

    ngOnInit() {
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.dataCenters = dataCenters;
            this.createCityBubbles();
        });
    }

    createCityBubbles() {
        for (let dataCenter of this.dataCenters) {
            let coordinates = CityNames.getCityCoordinates(dataCenter.location.country, dataCenter.location.place);
            this.bubbles.push({
                name: dataCenter.name,
                country: dataCenter.location.country,
                jobs: dataCenter.averageJobsPerDay,
                usage: dataCenter.capacityUtilization,
                data: dataCenter.dataSize,
                clusters: dataCenter.noOfClusters,
                location: dataCenter.location.place,
                radius:10,
                yield: 400,
                fillKey: (dataCenter.status === undefined || dataCenter.status.length === 0) ? 'UNKNOWN' : dataCenter.status,
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
