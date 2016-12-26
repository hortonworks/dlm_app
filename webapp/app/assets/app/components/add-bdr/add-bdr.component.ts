import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import Rx from 'rxjs/Rx';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../common/utils/city-names';
import {DataCenterDetails} from '../../models/data-center-details';
import {Ambari} from '../../models/ambari';
import {BackupPolicy} from '../../models/backup-policy';
import {Location} from '../../models/location';
import {DataCenterService} from '../../services/data-center.service';
import {AmbariService} from '../../services/ambari.service';
import {BackupPolicyService} from '../../services/backup-policy.service';

declare var Datamap:any;
declare var d3:any;

@Component({
    selector: 'add-bdr',
    templateUrl: 'assets/app/components/add-bdr/add-bdr.component.html',
    styleUrls: ['assets/app/components/add-bdr/add-bdr.component.scss']
})
export class AddBdrComponent implements OnInit, AfterViewInit {

  state: {
    isInProgress: boolean,
    isSuccessful: boolean,
    error?: any
  } = {
    isInProgress: true,
    isSuccessful: false
  };

    rxReady: Rx.Observable<any>;
    map: any;
    mapCities: {
      source?: {
        location: Location
        template: string
      },
      target?: {
        location: Location
        template: string
      }
    } = {};

    entity = 'Table';
    nowDate: string = new Date().toISOString().substring(0,10);
    welcomeText = `Configure Backup and Disaster Recovery for the selected Entity. You can select the target cluster to copy the data and the schedule for backup and recovery`;
    dataCenterOptions: Array<DataCenter> = [];
    clusterOptions: Array<Ambari> = [];
    sourceClusterOptions: Array<Ambari> = [];
    mode: string = '';
    policyId: string = '';
    isAdvancedEnabled: boolean = false;

    label: string = '';
    source: {
      dataCenter?: DataCenter,
      cluster?: Ambari,
      resourceId?: string,
      resourceType?: string
    } = {};
    target: {
      dataCenter?: DataCenter,
      cluster?: Ambari
    } = {};
    status: {
      isEnabled: boolean,
      since?: string,
      tSince?: string
    } = {
      isEnabled: false
    };
    schedule: {
      scheduleType?: string,
      frequency?: string,

      /*
      recurs?: number,
      recurrence?: {
        type?: string,
        magnitude?: number,
        unit?: string,
        time?: string,
        at?: string
      },
      */

      duration: {
        start: string,
        stop: string
      }
    } = {
      duration: {
        start: this.nowDate,
        stop: ''
      }
    };

    constructor(
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private dcService: DataCenterService,
      private ambariService: AmbariService,
      private policyService: BackupPolicyService
    ) {}

    ngOnInit() {
      const rxSourceClusterOptions = new Rx.Subject<string>();
      const rxInit = this.activatedRoute.params;

      const [rxCreateInit, rxEditInit] = rxInit.partition(() => this.activatedRoute.snapshot.queryParams.hasOwnProperty('create'));

      const rxCreate =
        rxCreateInit
          .map(params => this.activatedRoute.snapshot.queryParams)
          .map(queryParams => ({
            dataCenterId: queryParams['dataCenter'] as string,
            clusterId: queryParams['cluster'] as string,
            resourceId: queryParams['resourceId'] as string,
            resourceType: queryParams['resourceType'] as string,
          }))
          .flatMap(
            ({dataCenterId, clusterId, resourceId, resourceType}) => Rx.Observable.forkJoin(
              this.dcService.getById(dataCenterId),
              clusterId ? this.ambariService.getById(clusterId) : Rx.Observable.of(undefined),
              Rx.Observable.of(resourceId),
              Rx.Observable.of(resourceType),
              (dataCenter, cluster, tableId) => ({
                dataCenter,
                cluster,
                resourceId,
                resourceType
              })
            )
          )
          .do(source => {
            if(!source.cluster) {
              rxSourceClusterOptions.next(source.dataCenter.name);
            }
          })
          .do(
            source => {
              this.mode = 'CREATE';
              this.source = source;
            }
          );

      const rxEdit =
        rxEditInit
          .map(params => params['key'] as string)
          .flatMap(policyId => this.policyService.getById(policyId))
          .do(
            policy => {
              this.mode = 'EDIT';
              // TODO
            }
          );

      const rxPrepare = this.dcService.get();

      this.rxReady =
        Rx.Observable
          .merge(rxCreate, rxEdit);

      this.rxReady
        .subscribe(
          policy => {
            this.state = {
              isInProgress: false,
              isSuccessful: true
            };
          }
        );

      rxPrepare
        .subscribe(dataCenters => {
          this.dataCenterOptions = dataCenters;
        });

      rxSourceClusterOptions
        .flatMap(cDataCenterId => this.dcService.getClustersByDataCenterId(cDataCenterId))
        .subscribe(ambariList => this.sourceClusterOptions = ambariList);
    }

    ngAfterViewInit() {
      this.rxReady
        .subscribe(
          () => {
            this.mapRender();
            this.mapRefresh();
          }
        );
    }

    doToggleAdvanced() {
      this.isAdvancedEnabled = !this.isAdvancedEnabled;
    }

    mapRefresh() {

      this.mapCities.source = {
        location: this.source.dataCenter.location,
        template:
          `<div>
            <div>${this.source.dataCenter.deployedAt}</div>
            <div>${this.source.dataCenter.name}</div>
            <div>
              ${
                  this.source.resourceType && this.source.resourceId
                  ? this.source.resourceType + ':' + this.source.resourceId
                  : ''
                }
            </div>
            <div>SOURCE</div>
          </div>`
      };
      if(this.target.dataCenter) {
        this.mapCities.target = {
            location: this.target.dataCenter.location,
            template:
              `<div>
                <div>${this.target.dataCenter.deployedAt}</div>
                <div>${this.target.dataCenter.name}</div>
                <div>
                  ${
                      this.source.resourceType && this.source.resourceId
                      ? this.source.resourceType + ':' + this.source.resourceId
                      : ''
                    }
                </div>
                <div>${this.schedule.frequency ? this.schedule.frequency : ''}</div>
              </div>`
          };
      }

      this.mapRenderCities();
      this.mapRenderArc();
    }

    doRefreshMap() {
      this.updateClusterOptions();
      this.mapRefresh();
    }

    updateClusterOptions() {
      const dataCenterId = this.target.dataCenter.name;

      this.dcService.getClustersByDataCenterId(dataCenterId)
        .subscribe(
          clusters => {
            this.clusterOptions = clusters;
          }
        );
    }

    mapRender() {
      this.map = new Datamap({
        element: document.getElementById('mapBackupPolicy'),
        projection: 'mercator',
        height: 295,
        width: 385,
        fills: {
          defaultFill: '#ABE3F3',
        },
        geographyConfig: {
          popupOnHover: false
        },
        bubblesConfig: {
          popupOnHover: true,
          popupTemplate: function(geography: any, data: any) {
              return '<div class="hoverinfo">' + data.template +'</div>';
          },
          borderWidth: '2',
          radius:5,
          borderColor: '#4C4C4C',
        },
        arcConfig: {
          strokeColor: '#DD1C77',
          strokeWidth: 1,
          arcSharpness: 1,
        },
        // setProjection: function(element) {
        //   let projection = d3.geo.equirectangular()
        //     .center([23, -3])
        //     .rotate([4.4, 0])
        //     .scale(400)
        //     .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
        //   let path = d3.geo.path()
        //     .projection(projection);

        //   return {path: path, projection: projection};
        // }
      });
    }

    mapRenderCities() {
      const bubbles =
        Object.keys(this.mapCities)
        .map(cKey => {
          const city = this.mapCities[cKey];

          const coordinates = CityNames.getCityCoordinates(city.location.country, city.location.place);


          return ({
            template: city.template,
            latitude: parseFloat(coordinates[0]),
            longitude: parseFloat(coordinates[1])
          });
        });

      this.map.bubbles(bubbles);
    }

    mapRenderArc() {
      if(Object.keys(this.mapCities).length !== 2) {
        return;
      }

      const points =
        Object.keys(this.mapCities)
        .map(cKey => {
          const city = this.mapCities[cKey];

          const coordinates = CityNames.getCityCoordinates(city.location.country, city.location.place);

          return ({
            latitude: parseFloat(coordinates[0]),
            longitude: parseFloat(coordinates[1])
          });
        });

      this.map.arc([{
        origin: points[0],
        destination: points[1]
      }]);
    }

    doCancel() {
      if(this.source && this.source.dataCenter.name && this.source.cluster) {
        this.router.navigate([`/ui/view-data/${this.source.dataCenter.name}?host=${this.source.cluster.host}`]);
        return;
      }
      if(this.source && this.source.dataCenter.name) {
        this.router.navigate([`/ui/view-cluster/${this.source.dataCenter.name}`]);
        return;
      }
      this.router.navigate(['/ui/dashboard']);
    }

    doSave() {
      const policy = new BackupPolicy();
      policy.label = this.label;
      policy.source = {
        dataCenterId: this.source.dataCenter.name,
        clusterId: this.source.cluster.host,
        resourceId: this.source.resourceId,
        resourceType: this.source.resourceType
      };
      policy.target = {
        dataCenterId: this.target.dataCenter.name,
        clusterId: this.target.cluster.host
      };
      policy.schedule = this.schedule;
      policy.status = this.status;

      this.policyService.create(policy)
        .subscribe(
          () => this.router.navigate(['/ui/dashboard'])
        );
    }

    // http://stackoverflow.com/a/39890184/640012
    doHandleInputDate(dateString: string) {
      if (dateString) {
        return new Date(dateString);
      } else {
          return null;
      }
    }
}
