import {Component,AfterViewInit, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import Rx from 'rxjs/Rx';
import {GeographyService} from '../../services/geography.service';
import {DataCenterService} from '../../services/data-center.service';
import {BackupPolicyService} from '../../services/backup-policy.service';
import {DataCenter} from '../../models/data-center';
import {BackupPolicyInDetail} from '../../models/backup-policy';
import {CityNames} from '../../common/utils/city-names';
import {DataCenterDetails} from '../../models/data-center-details';
import {MathUtils} from '../../shared/utils/mathUtils';

declare var Datamap:any;
declare const L: any;

export class DashboardRow {
    dataCenter: DataCenter;
    nodes: number = 0;
    capacityUtilization: number = 0;
    averageJobsPerDay: number = 0;
    dataSize: string;
    cost: number = 0;
    clusters: number = 0;
    hostStatus: string = '';

    constructor(
      dataCenter: DataCenter,
      dataCenterDetails: DataCenterDetails
    ) {
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
        this.dataSize = MathUtils.bytesToSize(diskUsed);
        this.clusters += dataCenterDetails.numClusters;
        this.hostStatus = state ? 'HEALTHY' : 'UNHEALTHY';
        this.capacityUtilization = parseFloat( ((this.capacityUtilization/( 100* dataCenterDetails.nameNodeInfo.length)) * 100).toPrecision(3) );
    }
}

const FILL_CODES = {
  HEALTHY: '#9FCE63',
  UNHEALTHY: '#D21E28',
  UNKNOWN: '#898989'
};

@Component({
    selector: 'dash-board',
    styleUrls: ['assets/app/components/dashboard/dashboard.css'],
    templateUrl: 'assets/app/components/dashboard/dashboard.html'
})
export default class DashboardComponent implements AfterViewInit, OnInit {
    map: any;
    dashboardRows: DashboardRow[] = [];

    constructor(
      private router: Router,
      private dataCenterService: DataCenterService,
      private geographyService: GeographyService,
      private bpService: BackupPolicyService
    ) {}

    ngAfterViewInit() {

      this.map =
        new L
          .Map('mapcontainer', {
            // options
            center: [0, 0],
            zoom: 1,
            // minZoom: 1,
            maxZoom: 5,
            // interaction options
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            // control options
            attributionControl: false,
            zoomControl: false
          });

      this.geographyService.getCountries()
        .subscribe(countrySet => {
          const baseLayer =
            L
              .geoJSON(countrySet, {
                style: {
                    fillColor: '#ABE3F3',
                    fillOpacity: 1,
                    weight: 1,
                    color: '#FDFDFD'
                }
              });

          // added pseudo layer to prevent empty space when zoomed out
          // https://github.com/Leaflet/Leaflet/blob/v1.0.2/src/layer/GeoJSON.js#L205
          const pseudoBaseLayer =
            L
              .geoJSON(countrySet, {
                style: {
                    fillColor: '#ABE3F3',
                    fillOpacity: 1,
                    weight: 1,
                    color: '#FDFDFD'
                },
                coordsToLatLng: (coords: number[]) => new L.LatLng(coords[1], coords[0] - 360, coords[2])
              });

          L
            .featureGroup([baseLayer, pseudoBaseLayer])
            .addTo(this.map)
            .bringToBack();
        });
    }

    ngOnInit() {
      const rxDataCenters = this.dataCenterService.get();

      const rxDashboardRows =
        rxDataCenters
          .flatMap(dataCenters => {
            const dashboardRowsRx =
              dataCenters
                .map(cDataCenter => {
                  const rxDashboardRow =
                    this.dataCenterService.getDetails(cDataCenter.name)
                      .map(cDetail => new DashboardRow(cDataCenter, cDetail));
                  return rxDashboardRow;
                });

            return Rx.Observable.forkJoin(dashboardRowsRx);
          });



      const rxPolicies = this.bpService.list();

      rxDashboardRows
        .subscribe(dashboardRows => this.dashboardRows = dashboardRows);

      rxDashboardRows
        .subscribe(dashboardRows => this.plotDataCenters(dashboardRows));

      rxPolicies
        .subscribe(policies => this.plotBackupPolicies(policies));

    }

    plotDataCenters(dashboardRows: DashboardRow[]) {
      const points =
        dashboardRows
          .map(cDashboardRow => {
            const position =
              CityNames.getLocation(cDashboardRow.dataCenter.location.country, cDashboardRow.dataCenter.location.place);

            const template =
              `
              <div class="demo-card-wide mdl-card mdl-shadow--2dp">
                <div class = "mdl-card__actions mdl-card--border">
                  <div> <div class = "card-super-text">${cDashboardRow.dataCenter.location.place}</div>
                  <div class = "card-title-text">${cDashboardRow.dataCenter.name}</div> </div>
                </div >
                <div class = "card-padding">
                  <table  class="card-table" cellspacing="0" style="background:#FFFFFF;font-size:12px;width:100%;border-radius:4px;">
                    <tr>
                      <td class="card-table-cell">JOBS</td>
                      <td class="card-table-cell">${cDashboardRow.averageJobsPerDay}</td>
                    </tr>
                    <tr>
                      <td class="card-table-cell">USAGE</td>
                      <td class="card-table-cell">${cDashboardRow.capacityUtilization}</td>
                    </tr>
                    <tr>
                      <td class="card-table-cell">DATA</td>
                      <td class="card-table-cell">${cDashboardRow.dataSize}</td>
                    </tr>
                    <tr>
                      <td class="card-table-cell">CLUSTERS</td>
                      <td class="card-table-cell">${cDashboardRow.clusters}</td>
                    </tr>
                  </table>
                </div>
              </div>
              `;

              const fillColor = cDashboardRow.hostStatus ? FILL_CODES[cDashboardRow.hostStatus] : '#ABE3F3';

              return ({
                position,
                template,
                fillColor
              });

          })
          .map(cPoint => {
            const marker =
              L
                .circleMarker(cPoint.position, {
                  radius: 10,
                  fillColor: cPoint.fillColor,
                  color: '#fff',
                  weight: 3,
                  fillOpacity: 0.8,
                })
                .bindPopup(cPoint.template, {
                  closeButton: false,
                  className: 'map__popup--replication'
                });

              return marker;
          });

      const pointsGroup =
        L
          .featureGroup(points)
          .addTo(this.map)
          .eachLayer(cLayer => {
            cLayer
              .on('mouseover', function (this: any, e) {
                this.openPopup();
              })
              .on('mouseout', function (this: any, e) {
                this.closePopup();
              });
          });

      this.map.fitBounds(pointsGroup.getBounds(), { padding: L.point(20, 20) });

    }

    onDataCenterSelect(dataCenter: DataCenter) {
        this.router.navigate(['/ui/view-cluster/' + dataCenter.name]);
    }

    plotBackupPolicies(policies: BackupPolicyInDetail[]) {
      const arcMap =
        policies
          .reduce((accumulator, cPolicy) => {
            const arcKey = `${cPolicy.source.dataCenter.name}#${cPolicy.target.dataCenter.name}`;
            if(!(arcKey in accumulator)) {
              const start = CityNames.getLocation(cPolicy.source.dataCenter.location.country, cPolicy.source.dataCenter.location.place);
              const stop =  CityNames.getLocation(cPolicy.target.dataCenter.location.country, cPolicy.target.dataCenter.location.place);
              accumulator[arcKey] = {
                start,
                stop,
                policies: []
              };
            }

            accumulator[arcKey].policies.push(cPolicy);
            return accumulator;
          }, {});

      const arcs =
        Object
          .keys(arcMap)
          .map(cArcKey => arcMap[cArcKey])
          .map(cArc => Object.assign({}, cArc, {
            template: '<div>'
              + cArc.policies.reduce((accumulator, cPolicy) => (
                `<li>${cPolicy.source.cluster.host} -> ${cPolicy.target.cluster.host}: ${cPolicy.source.resourceType}: ${cPolicy.source.resourceId}</li>`
                ), '')
              + '</div>'
          }))
          .map(cArc => new L.Curve(
              this.getCurvePointWithOffset(cArc.start, cArc.stop),
              {
                color: 'rgb(50, 50, 50)',
                weight: 2,
                dashArray: '5, 5',
                offset: 10,
                vertices: 500,
                animate: {duration: 3000, iterations: Infinity}
              }
            ).bindPopup(cArc.template, {
              closeButton: false
            }));

        const arcGroup =
          L
            .featureGroup(arcs)
            .addTo(this.map)
            .eachLayer(cLayer => {
              cLayer
                .on('click', function (this: any, e) {
                  const position = e.latlng;
                  this.openPopup();
                  this._popup.setLatLng(position);
                });
            });
    }

    getCurvePointWithOffset(pointA, pointB) {
      const cx = (pointA[0] + pointB[0]) / 2;
      const cy = (pointA[1] + pointB[1]) / 2;
      const dx = (pointB[0] - pointA[0]) / 2;
      const dy = (pointB[1] - pointA[1]) / 2;

      //
      const k = 60;

      const dd = Math.sqrt(dx * dx + dy * dy);
      let ex = cx - dy / dd * k * 1 / 2;
      let ey = cy + dx / dd * k * 1 / 2;

      ex = Number.isNaN(ex) ? cx : ex;
      ey = Number.isNaN(ey) ? cy : ey;

      return ([
        'M',[pointA[0], pointA[1]],
        'Q',[ex, ey],
            [pointB[0], pointB[1]]
      ]);
    }
}
