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

            L
              .featureGroup([baseLayer])
              .addTo(this.map)
              .bringToBack();
        });
    }

    ngAfterViewInit() {
      //
    }

    drawMap(policies: BackupPolicyInDetail[]) {
      // required to fix maps
      this.map.invalidateSize(false);

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
                target: Object.assign({}, cLocation.source, {
                  radius: 10,
                  fillColor: 'rgb(45, 205, 55)'
                }),
                isArcDrawable: false
              });
            } else {
              return ({
                source: Object.assign({}, cLocation.source, {
                  radius: 5,
                  fillColor: 'rgb(45, 205, 55)'
                }),
                target: Object.assign({}, cLocation.source, {
                  radius: 5,
                  fillColor: 'rgb(52, 142, 60)'
                }),
                isArcDrawable: false
              });
            }
          });

        const points =
          edges
            .reduce((accumulator, cPolicyLocation) => ([
              ...accumulator,
              L
                .circleMarker(cPolicyLocation.target.position, {
                  radius: cPolicyLocation.target.radius,
                  fillColor: cPolicyLocation.target.fillColor,
                  color: '#fff',
                  weight: 1,
                  fillOpacity: 0.8,
                })
                .bindPopup(`hola!`),
              L
                .circleMarker(cPolicyLocation.source.position, {
                  radius: cPolicyLocation.source.radius,
                  fillColor: cPolicyLocation.source.fillColor,
                  color: '#fff',
                  weight: 1,
                  fillOpacity: 0.8,
                })
                .bindPopup(`hola2`)
            ]), []);

        const arcs =
          edges
            .filter(cEdge => cEdge.isArcDrawable)
            .map(cEdge => ({
              origin: cEdge.source,
              destination: cEdge.target
            }));

          const featureGroup =
            L
              .featureGroup(points)
              .addTo(this.map)
              .on('mouseover', function (this: any, e) {
                console.log(arguments);
                this.openPopup();
              })
              .on('mouseout', function (this: any, e) {
                console.log(arguments);
                this.closePopup();
              })
              .off('click')
              .on('click', () => console.log('click2'));

          this.map.fitBounds(featureGroup.getBounds(), { padding: L.point(20, 20) });
          // featureGroup.addTo(this.map).on('click', () => console.log('click2')).bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();
        // this.map.arc(arcs);
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
}
