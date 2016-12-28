import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';
import {GeographyService} from '../../services/geography.service';
import {AmbariService} from '../../services/ambari.service';
import {BackupPolicyService} from '../../services/backup-policy.service';
import {Ambari} from '../../models/ambari';
import {BackupPolicyInDetail} from '../../models/backup-policy';
import {DataCenterService} from '../../services/data-center.service';
import Rx from 'rxjs/Rx';
import {CityNames} from '../../common/utils/city-names';

declare const L:any;
declare var Datamap:any;

@Component({
    selector: 'view-data',
    templateUrl: 'assets/app/components/view-data/view-data.component.html',
    styleUrls: ['assets/app/components/view-data/view-data.component.css']
})
export class ViewDataComponent implements OnInit, AfterViewInit {
    map: any;
    pointsGroup: any;
    arcsGroup: any;

    hostName: string;
    search: string = '';
    dataSourceName: string;
    breadCrumbMap: any = {};
    cluster: Ambari = new Ambari();
    backupPolicies: BackupPolicyInDetail[] = [];
    rxSearch: Rx.Subject<string> = new Rx.Subject<string>();

    @ViewChild('bread-crumb') breadCrumb: BreadcrumbComponent;

    constructor(
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private clusterService: AmbariService,
      private policyService: BackupPolicyService,
      private dcService: DataCenterService,
      private geographyService: GeographyService
    ) {

      const rxSearchAction =
        this.rxSearch
          .do(searchKey => this.search = searchKey);

      const rxBackupPolicies =
        rxSearchAction
          .flatMap(searchKey => this.policyService.getByResource(searchKey, 'table'));

      rxBackupPolicies
        .do(policies => this.backupPolicies = policies)
        .do(policies => this.drawMap(policies))
        .subscribe(() => {/****/});

    }

    ngOnInit() {

      this.activatedRoute.params.subscribe(params => {
          this.dataSourceName = params['id'];
          this.hostName = this.activatedRoute.snapshot.queryParams['host'];
          this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
          this.breadCrumbMap[this.dataSourceName] = '';
          this.getClusterData();

          const searchKey = this.activatedRoute.snapshot.queryParams['id'];
          if(searchKey) {
              this.rxSearch.next(searchKey);
          }
      });

      this.map =
        new L
          .Map('mapcontainer-replication__map', {
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

    ngAfterViewInit() {
      //
    }

    drawMap(policies: BackupPolicyInDetail[]) {
      // required to fix maps
      this.map.invalidateSize(true);
      this.pointsGroup && this.map.removeLayer(this.pointsGroup);
      this.arcsGroup && this.map.removeLayer(this.arcsGroup);

      if(policies.length === 0) {
        // do nothing and return
        this.map.panTo(new L.LatLng(0, 0));
        return;
      }

      const edges =
        policies
          .map(cPolicy => ({
            source: {
              template:
                `<div>
                    <div>${cPolicy.source.dataCenter.deployedAt}</div>
                    <div>${cPolicy.source.dataCenter.name}</div>
                    <div>
                      ${
                          cPolicy.source.resourceType && cPolicy.source.resourceId
                          ? cPolicy.source.resourceType + ':' + cPolicy.source.resourceId
                          : ''
                        }
                    </div>
                    <div>SOURCE</div>
                  </div>`,
                position: CityNames.getCityCoordinates(cPolicy.source.dataCenter.location.country, cPolicy.source.dataCenter.location.place)
              },
            target: {
              template:
                `<div>
                    <div>${cPolicy.target.dataCenter.deployedAt}</div>
                    <div>${cPolicy.target.dataCenter.name}</div>
                    <div>
                      ${
                          cPolicy.source.resourceType && cPolicy.source.resourceId
                          ? cPolicy.source.resourceType + ':' + cPolicy.source.resourceId
                          : ''
                        }
                    </div>
                    <div>${cPolicy.schedule && cPolicy.schedule.frequency ? cPolicy.schedule.frequency : ''}</div>
                  </div>`,
              position: CityNames.getCityCoordinates(cPolicy.target.dataCenter.location.country, cPolicy.target.dataCenter.location.place)
            }
          }))
          .map(cLocation => {
            if(
              cLocation.source.position[0] === cLocation.target.position[0]
              && cLocation.source.position[1] === cLocation.target.position[1]
            ) {
              // same source and target
              return ({
                source: Object.assign({}, cLocation.source, {
                  radius: 5,
                  fillColor: 'rgb(45, 205, 55)'
                }),
                target: Object.assign({}, cLocation.target, {
                  radius: 12,
                  fillColor: 'rgb(52, 142, 60)'
                }),
                isArcDrawable: false
              });
            } else {
              return ({
                source: Object.assign({}, cLocation.source, {
                  radius: 5,
                  fillColor: 'rgb(45, 205, 55)'
                }),
                target: Object.assign({}, cLocation.target, {
                  radius: 5,
                  fillColor: 'rgb(45, 205, 55)'
                }),
                isArcDrawable: true
              });
            }
          });

        const points =
          edges
            .reduce((accumulator, cEdge) => ([
              ...accumulator,
              L
                .circleMarker(cEdge.target.position, {
                  radius: cEdge.target.radius,
                  fillColor: cEdge.target.fillColor,
                  color: '#fff',
                  weight: 3,
                  fillOpacity: 0.8,
                })
                .bindPopup(cEdge.target.template, {
                  closeButton: false,
                  className: 'map__popup--replication'
                }),
              L
                .circleMarker(cEdge.source.position, {
                  radius: cEdge.source.radius,
                  fillColor: cEdge.source.fillColor,
                  color: '#fff',
                  weight: 3,
                  fillOpacity: 0.8,
                })
                .bindPopup(cEdge.source.template, {
                  closeButton: false,
                  className: 'map__popup--replication'
                })
            ]), []);

        // const arcs =
        //   edges
        //     .filter(cEdge => cEdge.isArcDrawable)
        //     .map(cEdge => L.Polyline.Arc(cEdge.source.position, cEdge.target.position, {
        //       color: 'rgb(50, 50, 50)',
        //       weight: 1,
        //       dashArray: '5, 5',
        //       offset: 10,
        //       vertices: 500
        //     }));

       /*
        * L.Polyline.Arc draws a big circle [GIS], which does not look good and hence might not be what we need. We are using an alternative which uses quadratic Bezier curves.
        * As described in http://stackoverflow.com/questions/31804392/create-svg-arcs-between-two-points
        */

        const arcs =
          edges
            .filter(cEdge => cEdge.isArcDrawable)
            .map(cEdge => new L.Curve(
              this.getCurvePointWithOffset(cEdge.source.position, cEdge.target.position),
              {
                color: 'rgb(50, 50, 50)',
                weight: 1,
                dashArray: '5, 5',
                offset: 10,
                vertices: 500
              }
            ));

        this.pointsGroup =
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

        this.arcsGroup =
          L
            .featureGroup(arcs)
            .addTo(this.map);

        this.map.fitBounds(this.pointsGroup.getBounds(), { padding: L.point(20, 20) });
    }

    getClusterData() {
        this.clusterService.getByName(this.dataSourceName).subscribe(cluster => {
            this.cluster = cluster;
        });
    }

    eventHandler($event, searchKey: string) {
        if ($event.keyCode === 13 && searchKey) {
            this.search = searchKey;

            // trigger observable
            this.rxSearch.next(searchKey);
        }
    }

    doGetTableDetail() {
//
    }

    doCreateBackupPolicy() {
        let navigationExtras = {
            'queryParams' : {
              create: '',
              cluster: this.hostName,
              dataCenter: this.dataSourceName,
              resourceId: this.search,
              resourceType: 'table',
            }
        };
        this.router.navigate(['/ui/backup-policy'], navigationExtras);
        return false;
    }

    getCurvePointWithOffset(pointA, pointB) {
      const cx = (pointA[0] + pointB[0]) / 2;
      const cy = (pointA[1] + pointB[1]) / 2;
      const dx = (pointB[0] - pointA[0]) / 2;
      const dy = (pointB[1] - pointA[1]) / 2;

      //
      const k = 60;

      const dd = Math.sqrt(dx * dx + dy * dy);
      const ex = cx - dy / dd * k * 1 / 2;
      const ey = cy + dx / dd * k * 1 / 2;

      return ([
        'M',[pointA[0], pointA[1]],
        'Q',[ex, ey],
            [pointB[0], pointB[1]]
      ]);
    }
}
