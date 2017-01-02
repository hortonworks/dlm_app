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

import {Environment} from '../../environment';

import {DataFilter} from '../../models/data-filter';
import {DataFilterWrapper} from '../../models/data-filter-wrapper';
import {SearchQueryService} from '../../services/search-query.service';
import {DataSet} from '../../models/data-set';
import {SearchQuery} from '../../models/search-query';
import {SearchParamWrapper} from '../../shared/data-plane-search/search-param-wrapper';

declare const L:any;
declare var Datamap:any;

enum DataSourceType {
  HIVE,
  HDFS,
  HBASE
}

@Component({
    selector: 'view-data',
    templateUrl: 'assets/app/components/view-data/view-data.component.html',
    styleUrls: [
      'assets/app/components/view-data/view-data.component.css',
      'assets/app/components/view-data/view-data.search.component.css'
    ]
})
export class ViewDataComponent implements OnInit, AfterViewInit {
    map: any;
    pointsGroup: any;
    arcsGroup: any;

    search: {
      resourceId: string,
      resourceType: string
    } = {
      resourceId: '',
      resourceType: 'hive'
    };
    DataSourceType = DataSourceType;
    activeDataSourceType: DataSourceType = DataSourceType.HIVE;

    hiveSearchParamWrappers: SearchParamWrapper[] = [];
    hbaseSearchParamWrappers: SearchParamWrapper[] = [];
    hdfsSearchParamWrappers: SearchParamWrapper[] = [];
    hiveFiltersWrapper: DataFilterWrapper[] = [new DataFilterWrapper(new DataFilter())];
    hbaseFiltersWrapper: DataFilterWrapper[] = [new DataFilterWrapper(new DataFilter())];
    hdfsFiltersWrapper: DataFilterWrapper[] = [new DataFilterWrapper(new DataFilter())];


    clusterHost: string;
    dataLakeName: string;

    breadCrumbMap: any = {};
    cluster: Ambari = new Ambari();
    backupPolicies: BackupPolicyInDetail[] = [];
    rxSearch: Rx.Subject<{
      resourceId: string,
      resourceType: string
    }> = new Rx.Subject<{
      resourceId: string,
      resourceType: string
    }>();

    @ViewChild('bread-crumb') breadCrumb: BreadcrumbComponent;

    constructor(
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private clusterService: AmbariService,
      private policyService: BackupPolicyService,
      private dcService: DataCenterService,
      private geographyService: GeographyService,

      private environment: Environment,
      private searchQueryService: SearchQueryService
    ) {

        this.rxSearch
          .subscribe(search => this.search = search);

      const rxBackupPolicies =
        this.rxSearch
          .flatMap(search => this.policyService.getByResource(search.resourceId, search.resourceType));

      rxBackupPolicies
        .do(policies => this.backupPolicies = policies)
        .do(policies => this.drawMap(policies))
        .subscribe(() => {/****/});

      this.hiveSearchParamWrappers = environment.hiveSearchParamWrappers;
      this.hbaseSearchParamWrappers = environment.hbaseSearchParamWrappers;
      this.hdfsSearchParamWrappers = environment.hdfsSearchParamWrappers;

    }

    ngOnInit() {

      this.activatedRoute.params.subscribe(params => {
          this.dataLakeName = params['id'];
          this.clusterHost = this.activatedRoute.snapshot.queryParams['host'];
          this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
          this.breadCrumbMap[this.dataLakeName] = '';
          this.getClusterData();

          const resourceId = this.activatedRoute.snapshot.queryParams['resourceId'];
          const resourceType = this.activatedRoute.snapshot.queryParams['resourceType'];
          if(resourceId && resourceType) {
              this.rxSearch.next({
                resourceId,
                resourceType
              });
          }
      });

      this.map && this.map.remove();

      this.map =
        new L
          .Map('mapcontainer-replication__map', {
            // options
            center: [0, 0],
            zoom: 1,
            // minZoom: 1,
            maxZoom: 3,
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
                .on('mouseover', () => {
                  this.openPopup();
                })
                .on('mouseout', () => {
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
        this.clusterService.getByName(this.dataLakeName).subscribe(cluster => {
            this.cluster = cluster;
        });
    }

    doExecuteFetch(resourceId: string, resourceType: string) {
        // trigger observable
        this.rxSearch.next({
          resourceId,
          resourceType
        });
    }

    doGetTableDetail() {
//
    }

    doCreateBackupPolicy() {
        let navigationExtras = {
            'queryParams' : {
              create: '',
              cluster: this.clusterHost,
              dataCenter: this.dataLakeName,
              resourceId: this.search.resourceId,
              resourceType: this.search.resourceType,
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

    doExecuteSearch($event, dataFilterWrapper: DataFilterWrapper, dataSourceType: string) {
      let searchQuery = new SearchQuery();
        searchQuery.dataCenter = this.dataLakeName;
        searchQuery.clusterHost = this.clusterHost;
        searchQuery.predicates = $event;
        this.searchQueryService.getData(searchQuery, dataSourceType)
        .subscribe(result => {
            dataFilterWrapper.data = result;

        });
    }

    addFilter($event, type: string) {

        $event.preventDefault();

        if (type === 'hive') {
            this.hiveFiltersWrapper.push(new DataFilterWrapper(new DataFilter()));
        }
        if (type === 'hbase') {
            this.hbaseFiltersWrapper.push(new DataFilterWrapper(new DataFilter()));
        }
        if (type === 'hdfs') {
            this.hdfsFiltersWrapper.push(new DataFilterWrapper(new DataFilter()));
        }
    }
}
