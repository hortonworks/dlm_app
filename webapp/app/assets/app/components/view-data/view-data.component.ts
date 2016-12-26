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

      this.rxSearch
        .do(searchKey => this.search = searchKey)
        .flatMap(searchKey => this.policyService.getByResource(searchKey, 'table'))
        .do(policies => this.backupPolicies = policies)
        .do(policies => this.drawMap(policies))
        .subscribe(() => {/****/});

    }

    ngOnInit() {

      this.activatedRoute.params.subscribe(params => {
          this.dataSourceName = params['id'];
          this.hostName = window.location.search.replace('?host=', '');
          this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
          this.breadCrumbMap[this.dataSourceName] = '';
          this.getClusterData();

          const searchKey = this.activatedRoute.snapshot.queryParams['id'];
          if(searchKey) {
              this.rxSearch.next(searchKey);
          }
      });
    }

    ngAfterViewInit() {
      this.map = new L.Map('mapcontainer-replication__map', {
        center: [0, 0],
        zoom: 1,
        zoomControl:false,
        maxZoom: 15
      });


      this.geographyService.getCountries()
        .subscribe(countrySet => L.geoJSON(countrySet, {}).addTo(this.map));
    }

    drawMap(policies: BackupPolicyInDetail[]) {
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
                  color: 'rgb(159, 206, 99)',
                  fillOpacity: 0.75
                }),
                target: Object.assign({}, cLocation.source, {
                  radius: 10,
                  color: 'rgb(73, 111, 1)',
                  fillOpacity: 0.75
                }),
                isArcDrawable: false
              });
            } else {
              return ({
                source: Object.assign({}, cLocation.source, {
                  radius: 5,
                  color: 'rgb(159, 206, 99)',
                  fillOpacity: 0.75,
                }),
                target: Object.assign({}, cLocation.source, {
                  radius: 10,
                  color: 'rgb(73, 111, 1)',
                  fillOpacity: 0.75,
                }),
                isArcDrawable: false
              });
            }
          });


        // this.map = new Datamap({
        //     element: document.getElementById('mapcontainer-replication__map'),
        //     projection: 'mercator',
        //     height: 600,
        //     width: 1116,
        //     fills: {
        //         defaultFill: policies.length > 0 ? '#ABE3F3' : 'rgb(236, 236, 236)',
        //         UP: '#9FCE63',
        //         DOWN: '#D21E28'
        //     },
        //     data: {
        //         'UP': {fillKey: 'UP'},
        //         'DOWN': {fillKey: 'DOWN'}
        //     },
        //     geographyConfig: {
        //         highlightFillColor: '#ADE4F3',
        //         popupOnHover: false,
        //         highlightOnHover: false,
        //     },
        //     bubblesConfig: {
        //         popupOnHover: true,
        //         popupTemplate: function(geography: any, data: any) {
        //           return '<div class="hoverinfo">' + data.template +'</div>';
        //         },
        //         borderWidth: 2,
        //         borderColor: '#FFFFFF',
        //         highlightBorderColor: '#898989',
        //         highlightBorderWidth: 2,
        //         highlightFillColor: '#898989'
        //       },
        //       arcConfig: {
        //         strokeColor: '#DD1C77',
        //         strokeWidth: 1,
        //         arcSharpness: 1,
        //       }
        // });

        const bubbles =
          edges
            .reduce((accumulator, cPolicyLocation) => ([
              ...accumulator,
              L.circleMarker(cPolicyLocation.target.position).bindPopup(`<div class="hoverinfo">${cPolicyLocation.target.template}</div>`),
              L.circleMarker(cPolicyLocation.source.position).bindPopup(`<div class="hoverinfo">${cPolicyLocation.source.template}</div>`)
            ]), []);

        const arcs =
          edges
            .filter(cEdge => cEdge.isArcDrawable)
            .map(cEdge => ({
              origin: cEdge.source,
              destination: cEdge.target
            }));

          const group = new L.featureGroup(bubbles);

          this.map.fitBounds(group.getBounds(), {padding: L.point(20, 20)});
          group.addTo(this.map);

        // this.map.bubbles(bubbles);
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
